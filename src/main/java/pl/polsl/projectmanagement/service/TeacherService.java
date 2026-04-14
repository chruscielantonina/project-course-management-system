package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.polsl.projectmanagement.model.Teacher;
import pl.polsl.projectmanagement.repository.TeacherRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final TeacherRepository teacherRepository;

    public List<Teacher> getAllTeacher() {
        return teacherRepository.findAll();
    }

    public Optional<Teacher> getStudentById(UUID id) {
        return teacherRepository.findById(id);
    }

    public Optional<Teacher> getStudentByEmail(String email) {
        return teacherRepository.findByTEmail(email);
    }

    @Transactional
    public Teacher createTeacher(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    @Transactional
    public Teacher updateTeacher(UUID id, Teacher updatedTeacher) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        teacher.setTFirstName(updatedTeacher.getTFirstName());
        teacher.setTLastName(updatedTeacher.getTLastName());
        teacher.setTEmail(updatedTeacher.getTEmail());

        return teacherRepository.save(teacher);
    }

    @Transactional
    public void deleteTeacher(UUID id) {
        teacherRepository.deleteById(id);
    }
}
