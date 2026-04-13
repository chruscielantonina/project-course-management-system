package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.polsl.projectmanagement.model.Student;
import pl.polsl.projectmanagement.model.Teacher;

import java.util.Optional;
import java.util.UUID;

// automatic methods like findAll(), findById(), save(), delete()
public interface TeacherRepository extends JpaRepository<Teacher, UUID> {
    Optional<Teacher> findByTEmail(String email);
}