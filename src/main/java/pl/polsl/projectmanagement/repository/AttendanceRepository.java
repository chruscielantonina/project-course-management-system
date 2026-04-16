package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.polsl.projectmanagement.model.Attendance;

import java.util.List;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    @Query("SELECT a FROM Attendance a WHERE a.student.sID = :studentId")
    List<Attendance> findAllByStudentId(@Param("studentId") UUID studentId);

    @Query("SELECT a FROM Attendance a WHERE a.student.sID = :studentId AND a.section.seID = :sectionId")
    List<Attendance> findAllByStudentIdAndSectionId(@Param("studentId") UUID studentId, @Param("sectionId") UUID sectionId);
}
