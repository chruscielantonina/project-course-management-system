package pl.polsl.projectmanagement.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
@Table(name = "sections")
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID seID;

    @Column
    private String seResult;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SectionStatus seState;

    @Column(nullable = false)
    private int maxCapacity;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;
}