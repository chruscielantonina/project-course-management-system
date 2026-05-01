package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
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
    private final SemesterRepository semesterRepository;



    @Transactional(readOnly = true)
    public SectionGradesViewResponse getGradesList(UUID sectionId) {

        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        List<StudentGradeResponse> students = section.getEnrolledStudents().stream()
                .map(ss -> new StudentGradeResponse(
                        ss.getStudent().getSID(),
                        ss.getStudent().getSFirstName() + " " + ss.getStudent().getSLastName(),
                        ss.getGrade() != null ? ss.getGrade().getGrade() : null
                ))
                .toList();

        boolean isEditable = section.getSemester().isCurrent();

        return new SectionGradesViewResponse(students, isEditable);
    }

    @Transactional
    public void saveGrades(SaveGradesRequest request) {
        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new RuntimeException("Section not found"));

        if (!section.getSemester().isCurrent()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Cannot edit grades for past semesters: " + section.getSemester().getSemYear()
            );
        }

        Map<UUID, String> newGradesMap = request.grades().stream()
                .collect(Collectors.toMap(
                        SaveGradesRequest.StudentGradeDto::studentId,
                        SaveGradesRequest.StudentGradeDto::grade
                ));

        for (StudentSection enrollment : section.getEnrolledStudents()) {
            UUID studentId = enrollment.getStudent().getSID();

            if (newGradesMap.containsKey(studentId)) {
                String val = newGradesMap.get(studentId);

                if (enrollment.getGrade() == null) {
                    Grade newGrade = new Grade();
                    newGrade.setGrade(val);
                    newGrade.setStudentSection(enrollment);
                    enrollment.setGrade(newGrade);
                } else {
                    enrollment.getGrade().setGrade(val);
                }
            }
        }
        sectionRepository.save(section);
    }
}