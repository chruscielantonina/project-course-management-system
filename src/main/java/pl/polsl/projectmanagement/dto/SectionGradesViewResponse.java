package pl.polsl.projectmanagement.dto;

import java.util.List;

public record SectionGradesViewResponse(
        List<StudentGradeResponse> studenst,
        boolean isEditable
) {}