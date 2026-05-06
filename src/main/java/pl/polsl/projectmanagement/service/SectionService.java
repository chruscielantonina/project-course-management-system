package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.polsl.projectmanagement.dto.*;
import pl.polsl.projectmanagement.model.*;
import pl.polsl.projectmanagement.repository.*;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SectionService {

    private final TeacherRepository teacherRepository;
    private final TopicRepository topicRepository;
    private final SemesterRepository semesterRepository;
    private final SectionRepository sectionRepository;
    private final StudentRepository studentRepository;
    private final StudentSectionRepository studentSectionRepository;

    @Transactional
    public SectionResponse addSection(UUID appUserId, CreateSectionRequest request) {
        Teacher teacher = getTeacherByAppUserId(appUserId);
        Topic topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        Semester semester = semesterRepository.findById(request.semesterId())
                .orElseThrow(() -> new RuntimeException("Semester not found"));

        Section section = new Section();
        section.setTeacher(teacher);
        section.setTopic(topic);
        section.setSemester(semester);
        section.setMaxCapacity(request.maxCapacity());
        section.setSeState(SectionStatus.CLOSED);

        Section savedSection = sectionRepository.save(section);

        return new SectionResponse(
                savedSection.getSeID(),
                savedSection.getProjectFileName(),
                savedSection.getSeState(),
                savedSection.getMaxCapacity(),
                savedSection.getTopic().getToID(),
                savedSection.getSemester().getSemID()
        );
    }

    @Transactional(readOnly = true)
    public List<SectionDashboardResponse> getSectionsForDashboard(UUID appUserId) {
        Teacher teacher = getTeacherByAppUserId(appUserId);
        List<Section> sections = sectionRepository.findAllByTeacherIdWithDetails(teacher.getTID());

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
    public void deleteSection(UUID sectionId, UUID appUserId) {
        Section section = sectionRepository.findById(sectionId).orElseThrow(() -> new RuntimeException("Section not found"));

        Teacher currentTeacher = getTeacherByAppUserId(appUserId);

        if (!section.getTeacher().getTID().equals(currentTeacher.getTID())) {
            throw new RuntimeException("You do not have permission to delete this section");
        }
        sectionRepository.delete(section);
    }

    @Transactional
    public void assignStudentsToSection(UUID sectionId, UUID appUserId, AssignStudentsRequest request) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        Teacher currentTeacher = getTeacherByAppUserId(appUserId);

        if (!section.getTeacher().getTID().equals(currentTeacher.getTID())) {
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

    @Transactional(readOnly = true)
    public List<StudentBasicResponse> getAvailableStudents() {
        return studentRepository.findAvailableStudents().stream()
                .map(s -> new StudentBasicResponse(
                        s.getSID(),
                        s.getSFirstName() + " " + s.getSLastName()
                )).toList();
    }

    private Teacher getTeacherByAppUserId(UUID appUserId) {
        return teacherRepository.findByAppUser_Id(appUserId)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found for current user"));
    }
}
