package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.polsl.projectmanagement.dto.CreateSemesterRequest;
import pl.polsl.projectmanagement.dto.UpdateSemesterRequest;
import pl.polsl.projectmanagement.model.*;
import pl.polsl.projectmanagement.repository.*;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final SemesterRepository semesterRepository;
    private final SectionRepository sectionRepository;
    private final StudentSemesterRepository studentSemesterRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    @Transactional
    public boolean createAccount(String firstName, String lastName, String email, String password, AccountType accountType) {
        try {

            if(appUserRepository.existsByEmail(email)) {
                return false;
            }

            AppUser appUser = new AppUser();
            appUser.setEmail(email);
            appUser.setPassword(passwordEncoder.encode(password));
            appUser.setAccountType(accountType);

            if (accountType == AccountType.STUDENT) {
                Student student = new Student();
                student.setSFirstName(firstName);
                student.setSLastName(lastName);
                student.setAppUser(appUser);
                studentRepository.save(student);
            } else if (accountType == AccountType.TEACHER) {
                Teacher teacher = new Teacher();
                teacher.setTFirstName(firstName);
                teacher.setTLastName(lastName);
                teacher.setAppUser(appUser);
                teacherRepository.save(teacher);
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean deleteStudent(UUID sId) {
        if (studentRepository.existsById(sId)) {
            studentRepository.deleteById(sId);
            return true;
        }
        return false;
    }

    public boolean deleteTeacher(UUID tId) {
        if (teacherRepository.existsById(tId)) {
            teacherRepository.deleteById(tId);
            return true;
        }
        return false;
    }

    public boolean editStudent(UUID sId, String firstName, String lastName, String email) {
        return studentRepository.findById(sId).map(student -> {
            student.setSFirstName(firstName);
            student.setSLastName(lastName);
            if (student.getAppUser() != null) {
                student.getAppUser().setEmail(email);
            }
            studentRepository.save(student);
            return true;
        }).orElse(false);
    }

    public boolean editTeacher(UUID tId, String firstName, String lastName, String email) {
        return teacherRepository.findById(tId).map(teacher -> {
            teacher.setTFirstName(firstName);
            teacher.setTLastName(lastName);
            if (teacher.getAppUser() != null) {
                teacher.getAppUser().setEmail(email);
            }
            teacherRepository.save(teacher);
            return true;
        }).orElse(false);
    }

    @Transactional
    public Semester addSemester(CreateSemesterRequest request) {

        if (request.isCurrent()) {
            semesterRepository.findByIsCurrentTrue().ifPresent(activeSemester -> {
                activeSemester.setCurrent(false);
                semesterRepository.save(activeSemester);
            });
        }

        Semester semester = new Semester();
        semester.setSemYear(request.semYear());
        semester.setSemField(request.semField());
        semester.setCurrent(request.isCurrent());

        return semesterRepository.save(semester);
    }

    public List<Semester> getAllSemesters() {
        return semesterRepository.findAll();
    }

    @Transactional
    public Semester updateSemester(UUID semesterId, UpdateSemesterRequest request) {
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new RuntimeException("Semester not found"));

        if (request.isCurrent() && !semester.isCurrent()) {
            semesterRepository.findByIsCurrentTrue().ifPresent(activeSemester -> {
                activeSemester.setCurrent(false);
                semesterRepository.save(activeSemester);
            });
        }

        semester.setSemYear(request.semYear());
        semester.setSemField(request.semField());
        semester.setCurrent(request.isCurrent());

        return semesterRepository.save(semester);
    }

    @Transactional
    public void deleteSemester(UUID semesterId) {
        Semester semester = semesterRepository.findById(semesterId)
                .orElseThrow(() -> new RuntimeException("Semester not found"));

        if (sectionRepository.existsBySemester_SemID(semesterId)) {
            throw new RuntimeException("Cannot delete semester: It already has assigned sections.");
        }

        if (studentSemesterRepository.existsBySemester_SemID(semesterId)) {
            throw new RuntimeException("Cannot delete semester: There are students enrolled in this semester.");
        }

        semesterRepository.delete(semester);
    }
}
