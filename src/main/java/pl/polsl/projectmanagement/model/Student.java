package pl.polsl.projectmanagement.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Entity
@Data
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID sID;

    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String sFirstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false)
    private String sLastName;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "app_user_id", referencedColumnName = "id")
    private AppUser appUser;

    @JsonProperty("email")
    public String getEmail() {
        return appUser != null ? appUser.getEmail() : null;
    }
}

