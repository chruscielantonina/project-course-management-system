package pl.polsl.projectmanagement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.polsl.projectmanagement.model.*;
import pl.polsl.projectmanagement.repository.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentService {

    private static final Logger logger = LoggerFactory.getLogger(StudentService.class);
    private final StudentRepository studentRepository;
    private final SectionRepository sectionRepository;
    private final StudentSectionRepository studentSectionRepository;
    private final AttendanceRepository attendanceRepository;
    private final GradeRepository gradeRepository;

    @Transactional
    public boolean signUpForSection(UUID appUserId, UUID sectionID) {
        // Use the correct method to find the student profile by the application user's ID
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

        // Use the student's actual primary key (student.getSID()) for the check
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
        // Find the student profile first
        Optional<Student> studentOpt = studentRepository.findByAppUser_Id(appUserId);
        if (studentOpt.isEmpty()) {
            logger.error("Sign-out failed: Student profile not found for AppUser ID: {}", appUserId);
            return false;
        }
        Student student = studentOpt.get();

        // Then find the specific enrollment using the student's actual ID
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

        // Find the student profile
        Optional<Student> studentOpt = studentRepository.findByAppUser_Id(appUserId);
        if (studentOpt.isEmpty()) {
            logger.error("Change section failed: Student profile not found for AppUser ID: {}", appUserId);
            return false;
        }
        Student student = studentOpt.get();

        // Ensure the student is actually in the old section before signing out
        if (!studentSectionRepository.existsByStudent_sIDAndSection_seID(student.getSID(), oldSectionId)) {
            logger.error("Change section failed: Student {} is not enrolled in the old section {}", student.getSID(), oldSectionId);
            return false;
        }

        // Attempt to sign up for the new section first.
        // We pass the appUserId, as signUpForSection expects it.
        if (signUpForSection(appUserId, newSectionId)) {
            // If successful, sign out from the old one
            signOutFromSection(appUserId, oldSectionId);
            return true;
        } else {
            // If sign-up fails, the student remains in their old section.
            logger.error("Change section failed because signing up for new section {} failed.", newSectionId);
            return false;
        }
    }


    public List<Attendance> reviewAttendance(UUID appUserId) {
        Optional<Student> studentOpt = studentRepository.findByAppUser_Id(appUserId);
        if (studentOpt.isEmpty()) {
            return List.of();
        }
        return attendanceRepository.findAllByStudentId(studentOpt.get().getSID());
    }

    public List<Grade> reviewGrades(UUID appUserId) {
        Optional<Student> studentOpt = studentRepository.findByAppUser_Id(appUserId);
        if (studentOpt.isEmpty()) {
            return List.of();
        }
        return gradeRepository.findAllByStudentId(studentOpt.get().getSID());
    }

    public List<Grade> reviewGradesForSection(UUID appUserId, UUID sectionId) {
        Optional<Student> studentOpt = studentRepository.findByAppUser_Id(appUserId);
        if (studentOpt.isEmpty()) {
            return List.of();
        }
        if (studentSectionRepository.findEnrollment(studentOpt.get().getSID(),sectionId).isEmpty()){
            return List.of();
        }
        return gradeRepository.findAllByStudentIdAndSectionId(studentOpt.get().getSID(),sectionId);
    }
}
