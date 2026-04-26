package pl.polsl.projectmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
@Table(name = "semesters")
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID semID;

    @Column(nullable = false)
    private int semYear;

    @NotBlank(message = "Field is required")
    @Column(nullable = false)
    private String semField;

    @Column(nullable = false)
    private boolean isCurrent = false;
}