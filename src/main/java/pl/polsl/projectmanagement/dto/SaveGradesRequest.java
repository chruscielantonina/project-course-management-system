package pl.polsl.projectmanagement.dto;

import java.util.List;
import java.util.UUID;

public record SaveGradesRequest(
        List<StudentGradeDto> grades
) {
    public record StudentGradeDto(
            UUID studentId,
            String grade
    ) {}
}
