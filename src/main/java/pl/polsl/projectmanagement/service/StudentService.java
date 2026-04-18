package pl.polsl.projectmanagement.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import pl.polsl.projectmanagement.model.*;
import pl.polsl.projectmanagement.repository.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final SectionRepository sectionRepository;
    private final StudentSectionRepository studentSectionRepository;
    private final AttendanceRepository attendanceRepository;
    private final GradeRepository gradeRepository;

    public boolean signUpForSection(UUID studentID, UUID sectionID) {
        try{

            Student student = studentRepository.findById(studentID).orElseThrow();
            Section section = sectionRepository.findById(sectionID).orElseThrow();

            if (studentSectionRepository.findEnrollment(studentID, sectionID).isPresent()) {
                return false;
            }

            StudentSection enrollment = new StudentSection();
            enrollment.setStudent(student);
            enrollment.setSection(section);
            enrollment.setEnrollmentDate(LocalDate.now());
            enrollment.setStatus("ACTIVE");
            studentSectionRepository.save(enrollment);

            return true;

        } catch(Exception e) {
            return false;
        }
    }

    public boolean signOutFromSection(UUID studentId, UUID sectionId) {
        return studentSectionRepository.findEnrollment(studentId, sectionId)
                .map(enrollment -> {
                    studentSectionRepository.delete(enrollment);
                    return true;
                }).orElse(false);
    }

    @Transactional
    public boolean changeSection(UUID studentId, UUID oldSectionId, UUID newSectionId) {
        if (!sectionRepository.existsById(newSectionId)) {
            return false;
        }
        if (signOutFromSection(studentId, oldSectionId)) {
            return signUpForSection(studentId, newSectionId);
        }
        return false;
    }

    public List<Attendance> reviewAttendance(UUID studentId) {

        if (!studentRepository.existsById(studentId)) {
            return List.of();
        }
        return attendanceRepository.findAllByStudentId(studentId);
    }

    public List<Grade> reviewGrades(UUID studentId) {
        if (!studentRepository.existsById(studentId)) {
            return List.of();
        }
        return gradeRepository.findAllByStudentId(studentId);
    }



}
