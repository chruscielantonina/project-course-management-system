package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.polsl.projectmanagement.model.Semester;

import java.util.Optional;
import java.util.UUID;

public interface SemesterRepository extends JpaRepository<Semester, UUID> {
    Optional<Semester> findByIsCurrentTrue();
}