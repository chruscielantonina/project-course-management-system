package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.polsl.projectmanagement.model.StudentSection;
import java.util.List;
import java.util.UUID;

public interface StudentSectionRepository extends JpaRepository<StudentSection, UUID> {
    List<StudentSection> findByStudentSID(UUID studentId);
    List<StudentSection> findBySectionSeID(UUID sectionId);
}