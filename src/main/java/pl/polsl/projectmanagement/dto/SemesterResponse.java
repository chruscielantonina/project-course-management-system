package pl.polsl.projectmanagement.dto;

import java.util.UUID;

public record SemesterResponse(
        UUID id,
        int semYear,
        String semField,
        boolean isCurrent
) {}