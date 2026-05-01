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

    @Transactional
    public void markAttendance(MarkAttendanceRequest request) {

        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new RuntimeException("Section not found"));

        List<Attendance> existingRecords = attendanceRepository.getAttendanceForSectionAndDate(
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

        List<Attendance> existingRecords = attendanceRepository.getAttendanceForSectionAndDate(sectionId, date);

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