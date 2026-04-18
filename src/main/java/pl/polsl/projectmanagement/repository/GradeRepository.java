package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.polsl.projectmanagement.model.Grade;

import java.util.List;
import java.util.UUID;

public interface GradeRepository {
    @Query("SELECT g FROM Grade g WHERE g.studentSection.student.sID = :studentId")
    List<Grade> findAllByStudentId(@Param("studentId") UUID studentId);

    @Query("SELECT g FROM Grade g WHERE g.studentSection.student.sID = :studentId " +
            "AND g.studentSection.section.seID = :sectionId")
    List<Grade> findAllByStudentIdAndSectionId(@Param("studentId") UUID studentId,
                                               @Param("sectionId") UUID sectionId);

    @Query("SELECT g FROM Grade g WHERE g.studentSection.id = :studentSectionId")
    List<Grade> findAllByStudentSectionId(@Param("studentSectionId") UUID studentSectionId);

}
