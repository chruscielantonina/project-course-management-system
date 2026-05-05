package pl.polsl.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateSemesterRequest(
        @NotNull int semYear,
        @NotBlank String semField,
        boolean isCurrent
) {}