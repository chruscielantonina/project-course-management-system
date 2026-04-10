package pl.polsl.projectmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
@Table(name = "topics")
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID toID;

    @NotBlank(message = "Topic name is required")
    @Column(nullable = false)
    private String toName;

    @Column(columnDefinition = "TEXT")
    private String toDescription;
}
