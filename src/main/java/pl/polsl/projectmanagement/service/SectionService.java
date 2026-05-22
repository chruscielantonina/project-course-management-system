package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pl.polsl.projectmanagement.dto.*;
import pl.polsl.projectmanagement.model.*;
import pl.polsl.projectmanagement.repository.*;
import org.springframework.core.io.Resource;

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
    private final FileStorageService fileStorageService;

    @Transactional
    public SectionResponse getSection(UUID teacherId, UUID sectionId) {
        Teacher teacher = getTeacherByAppUserId(teacherId);
        Section section = sectionRepository.findById(sectionId).orElseThrow(() -> new RuntimeException("Section not found"));

        if(!section.getTeacher().getTID().equals(teacher.getTID())) {
            throw new RuntimeException("You do not have permission to get this section");
        }

        return new SectionResponse(
                section.getSeID(),
                section.getProjectFileName(),
                section.getSeState(),
                section.getMaxCapacity(),
                section.getTopic().getToID(),
                section.getSemester().getSemID()
        );
    }

    @Transactional(readOnly = true)
    public List<SectionDashboardResponse> getAllSectionsForStudents() {
        List<Section> sections = sectionRepository.findAll();

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
                    section.getProjectFileName(),
                    students
            );
        }).toList();
    }

    @Transactional
    public SectionResponse addSection(UUID appUserId, CreateSectionRequest request) {
        Teacher teacher = getTeacherByAppUserId(appUserId);
        Topic topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        Semester semester = semesterRepository.findByIsCurrentTrue()
                .orElseThrow(() -> new RuntimeException("Semester not found"));

        Section section = new Section();
        section.setTeacher(teacher);
        section.setTopic(topic);
        section.setSeState(request.sectionStatus());
        section.setSemester(semester);
        section.setMaxCapacity(request.maxCapacity());
        section.setSeState(request.sectionStatus());

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

    @Transactional
    public SectionResponse updateSection(UUID teacherId, UUID sectionId, CreateSectionRequest request) {
        Teacher teacher = getTeacherByAppUserId(teacherId);
        Section section = sectionRepository.findById(sectionId).orElseThrow(() -> new RuntimeException("Section not found."));
        Topic topic = topicRepository.findById(request.topicId()).orElseThrow(() -> new RuntimeException("Topic not found."));

        if (!section.getTeacher().getTID().equals(teacher.getTID())) {
           throw new RuntimeException("You do not have permission to update this section");
        }

        int currentStudentCount = section.getEnrolledStudents() != null ? section.getEnrolledStudents().size() : 0;
        if(request.maxCapacity() < currentStudentCount) {
            throw new RuntimeException("Cannot lower max capacity below current number of enrolled students (" + currentStudentCount + ").");
        }

        section.setTopic(topic);
        section.setSeState(request.sectionStatus());
        section.setMaxCapacity(request.maxCapacity());
        sectionRepository.save(section);

        return new SectionResponse(
                section.getSeID(),
                section.getProjectFileName(),
                section.getSeState(),
                section.getMaxCapacity(),
                section.getTopic().getToID(),
                section.getSemester().getSemID()
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
                    section.getProjectFileName(),
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

    @Transactional
    public void uploadSectionProject(UUID sectionId, UUID currentAppUserId, MultipartFile file) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        Student currentStudent = studentRepository.findByAppUser_Id(currentAppUserId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        boolean isStudentInSection = studentSectionRepository
                .existsByStudent_sIDAndSection_seID(currentStudent.getSID(), sectionId);

        if (!isStudentInSection) {
            throw new RuntimeException("You are not authorized to upload a project for this section.");
        }

        String savedFileName = fileStorageService.storeProjectFile(sectionId, file);

        section.setProjectFileName(savedFileName);
        section.setProjectFilePath("/uploads/" + savedFileName);
        sectionRepository.save(section);
    }

    @Transactional(readOnly = true)
    public Resource downloadSectionProject(UUID sectionId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        if (section.getProjectFileName() == null) {
            throw new RuntimeException("No project file uploaded for this section.");
        }

        return fileStorageService.loadFileAsResource(section.getProjectFileName());
    }

    @Transactional
    public void deleteSectionProject(UUID sectionId, UUID appUserId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        if (section.getProjectFileName() == null) {
            throw new RuntimeException("No project file to delete.");
        }

        fileStorageService.deleteFile(section.getProjectFileName());

        section.setProjectFileName(null);
        section.setProjectFilePath(null);
        sectionRepository.save(section);
    }
}
