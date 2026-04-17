package pl.polsl.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateTopicRequest {

    @NotBlank(message = "Topic name is required.")
    @Size(min = 5, max = 255, message = "The topic name must be between 1 and 255 characters.")
    private String name;

    @Size(max = 2000, message = "The description can be up to 2000 characters long.")
    private String description;

    private boolean isActive;

    @NotNull(message = "Teacher ID is required.")
    private UUID teacherId;
}