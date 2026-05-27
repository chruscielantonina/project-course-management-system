package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pl.polsl.projectmanagement.dto.*;
import pl.polsl.projectmanagement.model.*;
import pl.polsl.projectmanagement.repository.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private static final Logger logger = LoggerFactory.getLogger(StudentService.class);
    private final TeacherRepository teacherRepository;
    private final TopicRepository topicRepository;
    private final SemesterRepository semesterRepository;
    private final SectionRepository sectionRepository;
    private final StudentRepository studentRepository;
    private final StudentSectionRepository studentSectionRepository;
    private final AttendanceRepository attendanceRepository;
    private final GradeRepository gradeRepository;

    @Transactional(readOnly = true)
    public Optional<SectionDashboardResponse> getMySection(UUID appUserId) {
        return studentSectionRepository.findByStudent_AppUser_Id(appUserId)
                .map(studentSection -> {
                    Section section = studentSection.getSection();
                    List<StudentBasicResponse> students = section.getEnrolledStudents().stream()
                            .map(ss -> new StudentBasicResponse(
                                    ss.getStudent().getSID(),
                                    ss.getStudent().getAppUser().getId(),
                                    ss.getStudent().getSFirstName() + " " + ss.getStudent().getSLastName()
                            )).toList();

                    String teacherName = section.getTeacher().getTFirstName() + " " + section.getTeacher().getTLastName();
                    String topicName = section.getTopic() != null ? section.getTopic().getToName() : "N/A";

                    return new SectionDashboardResponse(
                            section.getSeID(),
                            topicName,
                            section.getSeState().name(),
                            teacherName,
                            students.size(),
                            section.getMaxCapacity(),
                            section.getProjectFileName(),
                            students
                    );
                });
    }

    @Transactional
    public boolean signUpForSection(UUID appUserId, UUID sectionID) {
        Optional<Student> studentOpt = studentRepository.findByAppUser_Id(appUserId);
        if (studentOpt.isEmpty()) {
            logger.error("Sign-up failed: Student profile not found for AppUser ID: {}", appUserId);
            return false;
        }
        Student student = studentOpt.get();

        Optional<Section> sectionOpt = sectionRepository.findById(sectionID);
        if (sectionOpt.isEmpty()) {
            logger.error("Sign-up failed: Section not found with ID: {}", sectionID);
            return false;
        }
        Section section = sectionOpt.get();

        if (studentSectionRepository.existsByStudent_sID(student.getSID())) {
            logger.error("Sign-up failed: Student {} is already enrolled in a section.", student.getSID());
            return false;
        }

        int currentOccupancy = studentSectionRepository.findBySectionSeID(sectionID).size();
        if (currentOccupancy >= section.getMaxCapacity()) {
            logger.error("Sign-up failed: Section {} is already full ({} / {}).", sectionID, currentOccupancy, section.getMaxCapacity());
            return false;
        }

        StudentSection enrollment = new StudentSection();
        enrollment.setStudent(student);
        enrollment.setSection(section);
        enrollment.setEnrollmentDate(LocalDate.now());
        enrollment.setStatus("ACTIVE");
        studentSectionRepository.save(enrollment);
        logger.info("Student {} successfully signed up for section {}", student.getSID(), sectionID);
        return true;
    }

    @Transactional
    public boolean signOutFromSection(UUID appUserId, UUID sectionId) {
        Optional<Student> studentOpt = studentRepository.findByAppUser_Id(appUserId);
        if (studentOpt.isEmpty()) {
            logger.error("Sign-out failed: Student profile not found for AppUser ID: {}", appUserId);
            return false;
        }
        Student student = studentOpt.get();

        return studentSectionRepository.findEnrollment(student.getSID(), sectionId)
                .map(enrollment -> {
                    studentSectionRepository.delete(enrollment);
                    logger.info("Student {} successfully signed out from section {}", student.getSID(), sectionId);
                    return true;
                }).orElseGet(() -> {
                    logger.error("Sign-out failed: Student {} is not enrolled in section {}", student.getSID(), sectionId);
                    return false;
                });
    }

    @Transactional
    public boolean changeSection(UUID appUserId, UUID oldSectionId, UUID newSectionId) {
        if (oldSectionId.equals(newSectionId)) {
            logger.warn("Change section failed: old and new section IDs are the same.");
            return false;
        }

        Optional<Student> studentOpt = studentRepository.findByAppUser_Id(appUserId);
        if (studentOpt.isEmpty()) {
            logger.error("Change section failed: Student profile not found for AppUser ID: {}", appUserId);
            return false;
        }
        Student student = studentOpt.get();

        Optional<Section> newSectionOpt = sectionRepository.findById(newSectionId);
        if (newSectionOpt.isEmpty()) {
            logger.error("Change section failed: New section not found with ID: {}", newSectionId);
            return false;
        }
        Section newSection = newSectionOpt.get();

        int currentOccupancy = studentSectionRepository.findBySectionSeID(newSectionId).size();
        if (currentOccupancy >= newSection.getMaxCapacity()) {
            logger.error("Change section failed: New section {} is full.", newSectionId);
            return false;
        }

        Optional<StudentSection> enrollmentOpt = studentSectionRepository.findEnrollment(student.getSID(), oldSectionId);
        if (enrollmentOpt.isEmpty()) {
            logger.error("Change section failed: Current enrollment for student {} in section {} not found.", student.getSID(), oldSectionId);
            return false;
        }
        
        StudentSection currentEnrollment = enrollmentOpt.get();
        currentEnrollment.setSection(newSection);
        currentEnrollment.setEnrollmentDate(LocalDate.now());
        studentSectionRepository.save(currentEnrollment);

        logger.info("Student {} successfully changed section from {} to {}", student.getSID(), oldSectionId, newSectionId);
        return true;
    }


    public List<AttendanceResponse> reviewAttendance(UUID appUserId) {
        Optional<Student> studentOpt = studentRepository.findByAppUser_Id(appUserId);
        if (studentOpt.isEmpty()) {
            return List.of();
        }
        return attendanceRepository.findAllByStudentId(studentOpt.get().getSID()).stream()
                .map(att -> new AttendanceResponse(att.getAID(), att.getADate(), att.getAttendanceStatus().name()))
                .collect(Collectors.toList());
    }

    public List<GradeResponse> reviewGrades(UUID appUserId) {
        Optional<Student> studentOpt = studentRepository.findByAppUser_Id(appUserId);
        if (studentOpt.isEmpty()) {
            return List.of();
        }
        return gradeRepository.findAllByStudentId(studentOpt.get().getSID()).stream()
                .map(grade -> new GradeResponse(grade.getGrID(), grade.getGrade()))
                .collect(Collectors.toList());
    }

    public List<GradeResponse> reviewGradesForSection(UUID appUserId, UUID sectionId) {
        Optional<Student> studentOpt = studentRepository.findByAppUser_Id(appUserId);
        if (studentOpt.isEmpty()) {
            return List.of();
        }
        if (studentSectionRepository.findEnrollment(studentOpt.get().getSID(),sectionId).isEmpty()){
            return List.of();
        }
        return gradeRepository.findAllByStudentIdAndSectionId(studentOpt.get().getSID(),sectionId).stream()
                .map(grade -> new GradeResponse(grade.getGrID(), grade.getGrade()))
                .collect(Collectors.toList());
    }
}
