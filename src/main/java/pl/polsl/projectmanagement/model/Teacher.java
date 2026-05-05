package pl.polsl.projectmanagement.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
@Table(name = "teachers")
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID tID;

    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String tFirstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false)
    private String tLastName;

    @Email(message = "Incorrect email format")
    @NotBlank(message = "Email is required")
    @Column(nullable = false, unique = true)
    private String tEmail;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "app_user_id", referencedColumnName = "id")
    private AppUser appUser;
}
