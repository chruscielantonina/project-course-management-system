package pl.polsl.projectmanagement.dto;

import java.util.UUID;

public record StudentGradeResponse(
        UUID studentId,
        String fullName,
        String grade
) {}
