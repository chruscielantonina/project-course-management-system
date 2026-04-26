package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.polsl.projectmanagement.dto.*;
import pl.polsl.projectmanagement.model.*;
import pl.polsl.projectmanagement.repository.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final TopicRepository topicRepository;
    private final SectionRepository sectionRepository;
    private final StudentSectionRepository studentSectionRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;

    public List<Topic> getAllTopics() {
        return topicRepository.findAll();
    }

    @Transactional
    public Topic addTopic(String name, String description, boolean isActive, UUID teacherId) {

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Topic topic = new Topic();
        topic.setToName(name);
        topic.setToDescription(description);
        topic.setActive(isActive);
        topic.setTeacher(teacher);
        return topicRepository.save(topic);
    }

    @Transactional
    public Topic updateTopic(UUID topicId, String name, String description, boolean isActive) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        topic.setToName(name);
        topic.setToDescription(description);
        topic.setActive(isActive);

        return topicRepository.save(topic);
    }

    @Transactional
    public void deleteTopic(UUID topicId) {
        if(!topicRepository.existsById(topicId)) {
            throw new RuntimeException("Topic not found");
        }
        topicRepository.deleteById(topicId);
    }

    @Transactional
    public UUID addSection(UUID teacherId, CreateSectionRequest request) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        Topic topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        Section section = new Section();
        section.setTeacher(teacher);
        section.setTopic(topic);
        section.setMaxCapacity(request.maxCapacity());
        section.setSeState(SectionStatus.CLOSED);

        Section savedSection = sectionRepository.save(section);

        return savedSection.getSeID();
    }

    @Transactional(readOnly = true)
    public List<SectionDashboardResponse> getSectionsForDashboard(UUID currentUserId) {
        List<Section> sections = sectionRepository.findAllByTeacherIdWithDetails(currentUserId);

        return sections.stream().map(section -> {
            List<StudentBasicResponse> students = section.getEnrolledStudents().stream()
                    .map(ss -> new StudentBasicResponse(
                            ss.getStudent().getSID(),
                            ss.getStudent().getSFirstName() + " " + ss.getStudent().getSLastName()
                    )).toList();

            String teacherName = section.getTeacher().getTFirstName() + " " + section.getTeacher().getTLastName();

            return new SectionDashboardResponse(
                    section.getSeID(),
                    section.getSeState().name(),
                    teacherName,
                    students.size(),
                    section.getMaxCapacity(),
                    students
            );
        }).toList();
    }

    @Transactional
    public void deleteSection(UUID sectionId, UUID currentUserId) {
        Section section = sectionRepository.findById(sectionId).orElseThrow(() -> new RuntimeException("Section not found"));

        if(!section.getTeacher().getTID().equals(currentUserId)) {
            throw new RuntimeException("You do not have permission to delete this section");
        }
        sectionRepository.delete(section);
    }

    @Transactional
    public void assignStudentsToSection(UUID sectionId, UUID currentUserId, AssignStudentsRequest request) {
        Section section= sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        if(!section.getTeacher().getTID().equals(currentUserId)) {
            throw new RuntimeException("You do not have permission to manage this section");
        }

        int currentStudentsCount = section.getEnrolledStudents().size();
        int studentsToAddCount = request.studentIds().size();

        if (currentStudentsCount + studentsToAddCount > section.getMaxCapacity()) {
            throw new RuntimeException("Cannot add students: Section capacity exceeded");
        }

        for (UUID studentId : request.studentIds()) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student with ID " + studentId + " not found"));

            List<StudentSection> existingEnrollments = studentSectionRepository.findAllByStudentId(studentId);
            if (!existingEnrollments.isEmpty()) {
                throw new RuntimeException("Student " + student.getSFirstName() + " is already enrolled in a section");
            }

            StudentSection newEnrollment = new StudentSection();
            newEnrollment.setSection(section);
            newEnrollment.setStudent(student);
            newEnrollment.setEnrollmentDate(java.time.LocalDate.now());
            newEnrollment.setStatus("REGISTERED");

            studentSectionRepository.save(newEnrollment);
        }
    }

    @Transactional
    public boolean addGrade(UUID studentSectionId, String grade) {
        return studentSectionRepository.findById(studentSectionId).map(ss -> {
            ss.setGrade(grade);
            studentSectionRepository.save(ss);
            return true;
        }).orElse(false);
    }

    @Transactional(readOnly = true)
    public List<StudentBasicResponse> getAvailableStudents() {
        return studentRepository.findAvailableStudents().stream()
                .map(s -> new StudentBasicResponse(
                        s.getSID(),
                        s.getSFirstName() + " " + s.getSLastName()
                )).toList();
    }

    @Transactional
    public void markAttendance(MarkAttendanceRequest request) {

        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new RuntimeException("Section not found"));

        List<Attendance> existingRecords = attendanceRepository.findAllBySection_SeIDAndADate(
                request.sectionId(),
                request.date()
        );

        List<UUID> studentIds = request.attendance().stream()
                .map(MarkAttendanceRequest.StudentAttendanceRecordDto::student)
                .toList();

        Map<UUID, Student> studentsMap = studentRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(Student::getSID, student -> student));

        List<Attendance> recordsToSave = new ArrayList<>();

        for (MarkAttendanceRequest.StudentAttendanceRecordDto dto : request.attendance()) {
            Student student = studentsMap.get(dto.student());
            if (student == null) {
                throw new RuntimeException("Student not found: " + dto.student());
            }

            Attendance attendance = existingRecords.stream()
                    .filter(a -> a.getStudent().getSID().equals(student.getSID()))
                    .findFirst()
                    .orElse(new Attendance());

            attendance.setSection(section);
            attendance.setStudent(student);
            attendance.setADate(request.date());
            attendance.setAttendanceStatus(dto.status());

            recordsToSave.add(attendance);
        }

        attendanceRepository.saveAll(recordsToSave);
    }

    @Transactional(readOnly = true)
    public List<StudentAttendanceResponse> getAttendanceList(UUID sectionId, LocalDate date) {

        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        List<Attendance> existingRecords = attendanceRepository.findAllBySection_SeIDAndADate(sectionId, date);

        Map<UUID, AttendanceStatus> attendanceMap = existingRecords.stream()
                .collect(Collectors.toMap(
                        a -> a.getStudent().getSID(),
                        Attendance::getAttendanceStatus
                ));

        return section.getEnrolledStudents().stream()
                .map(StudentSection::getStudent)
                .map(student -> new StudentAttendanceResponse(
                        student.getSID(),
                        student.getSFirstName() + " " + student.getSLastName(),
                        attendanceMap.get(student.getSID())
                ))
                .toList();
    }
}
