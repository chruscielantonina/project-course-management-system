package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.polsl.projectmanagement.model.AccountType;
import pl.polsl.projectmanagement.model.AppUser;
import pl.polsl.projectmanagement.model.Student;
import pl.polsl.projectmanagement.model.Teacher;
import pl.polsl.projectmanagement.repository.AppUserRepository;
import pl.polsl.projectmanagement.repository.StudentRepository;
import pl.polsl.projectmanagement.repository.TeacherRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

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
}
