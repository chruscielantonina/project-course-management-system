package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.polsl.projectmanagement.dto.MarkAttendanceRequest;
import pl.polsl.projectmanagement.dto.StudentAttendanceResponse;
import pl.polsl.projectmanagement.model.*;
import pl.polsl.projectmanagement.repository.AttendanceRepository;
import pl.polsl.projectmanagement.repository.SectionRepository;
import pl.polsl.projectmanagement.repository.StudentRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final SectionRepository sectionRepository;
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public void markAttendance(UUID sectionId, MarkAttendanceRequest request) {

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
}
