package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.polsl.projectmanagement.model.Admin;
import java.util.UUID;

public interface AdminRepository extends JpaRepository<Admin, UUID> {
}
