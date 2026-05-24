package pl.polsl.projectmanagement.dto;

import java.util.UUID;

public record GradeResponse(
    UUID gradeId,
    String gradeValue
) {}
