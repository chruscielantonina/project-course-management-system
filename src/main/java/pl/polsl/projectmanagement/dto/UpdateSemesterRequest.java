package pl.polsl.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateSemesterRequest(
        @NotNull(message = "Year is required")
        int semYear,

        @NotBlank(message = "Field of study is required")
        String semField,

        boolean isCurrent
) {}