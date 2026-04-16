package pl.polsl.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTopicRequest {
    @NotBlank(message = "Topic name is required")
    private String name;

    private String description;
}