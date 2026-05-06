package pl.polsl.projectmanagement.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Table(name = "sections")
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID seID;

    @Column
    private String projectFileName;

    @Column
    private String projectFilePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SectionStatus seState;

    @Column(nullable = false)
    private int maxCapacity;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentSection> enrolledStudents = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;
}