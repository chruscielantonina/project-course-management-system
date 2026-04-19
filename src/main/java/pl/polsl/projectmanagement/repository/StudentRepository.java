package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pl.polsl.projectmanagement.model.Student;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// automatic methods like findAll(), findById(), save(), delete()
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findBySEmail(String email);

    @Query("SELECT s FROM Student s WHERE s.sID NOT IN (SELECT ss.student.sID FROM StudentSection ss)")
    List<Student> findAvailableStudents();
}