package pl.polsl.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.polsl.projectmanagement.model.Topic;
import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {
}