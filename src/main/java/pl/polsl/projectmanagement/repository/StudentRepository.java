package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.polsl.projectmanagement.model.Student;
import java.util.Optional;
import java.util.UUID;

// automatic methods like findAll(), findById(), save(), delete()
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findBySEmail(String email);
}