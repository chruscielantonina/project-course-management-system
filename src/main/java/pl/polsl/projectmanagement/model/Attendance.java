package pl.polsl.projectmanagement.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Data
@Table(name = "attendances")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID aID;

    @Column(nullable = false)
    private LocalDate aDate;

    @Column(nullable = false)
    private String aStatus;
}