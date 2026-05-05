package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.polsl.projectmanagement.model.StudentSemester;
import java.util.List;
import java.util.UUID;

public interface StudentSemesterRepository extends JpaRepository<StudentSemester, UUID> {
    List<StudentSemester> findByStudentSID(UUID studentId);
    boolean existsBySemester_SemID(UUID semID);
}