package pl.polsl.projectmanagement.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;
import pl.polsl.projectmanagement.model.Grade;

@Entity
@Data
@Table(name = "student_sections")
public class StudentSection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @OneToOne(mappedBy = "studentSection", cascade = CascadeType.ALL, orphanRemoval = true)
    private Grade grade;

    @Column(nullable = false)
    private LocalDate enrollmentDate;

    @Column(nullable = false)
    private String status;
}