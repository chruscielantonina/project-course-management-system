package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.polsl.projectmanagement.model.Section;
import pl.polsl.projectmanagement.model.SectionStatus;
import java.util.List;
import java.util.UUID;

public interface SectionRepository extends JpaRepository<Section, UUID> {
    List<Section> findBySeState(SectionStatus status);

    @Query("SELECT DISTINCT s FROM Section s " +
            " JOIN FETCH s.teacher t " +
            "LEFT JOIN FETCH s.enrolledStudents ss " +
            "LEFT JOIN FETCH ss.student " +
            "WHERE t.tID = :teacherId")
    List<Section> findAllByTeacherIdWithDetails(@Param("teacherId") UUID teacherId);

    boolean existsBySemester_SemID(UUID semID);
}