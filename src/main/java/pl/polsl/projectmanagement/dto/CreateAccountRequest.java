package pl.polsl.projectmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import pl.polsl.projectmanagement.model.AccountType;

@Data
public class CreateAccountRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Incorrect email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotNull(message = "Account type is required")
    private AccountType accountType;
}