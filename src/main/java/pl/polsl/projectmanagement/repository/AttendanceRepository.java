package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.polsl.projectmanagement.model.Attendance;

import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
}
