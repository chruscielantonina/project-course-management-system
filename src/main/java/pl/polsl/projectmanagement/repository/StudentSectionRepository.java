package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.polsl.projectmanagement.model.StudentSection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StudentSectionRepository extends JpaRepository<StudentSection, UUID> {
    List<StudentSection> findByStudentSID(UUID studentId);
    List<StudentSection> findBySectionSeID(UUID sectionId);

    @Query("SELECT ss FROM StudentSection ss WHERE ss.student.sID = :sId AND ss.section.seID = :seId")
    Optional<StudentSection> findEnrollment(@Param("sId") UUID sId, @Param("seId") UUID seId);

    @Query("SELECT ss FROM StudentSection ss WHERE ss.student.sID = :sId")
    List<StudentSection> findAllByStudentId(@Param("sId") UUID sId);

    boolean existsByStudent_sIDAndSection_seID(UUID studentId, UUID sectionId);

    boolean existsByStudent_sID(UUID studentId);

    // Find an enrollment by the AppUser's ID
    Optional<StudentSection> findByStudent_AppUser_Id(UUID appUserId);
}
