package pl.polsl.projectmanagement.dto;

import java.util.List;
import java.util.UUID;

public record SectionDashboardResponse(
        UUID sectionId,
        String topic, // Added this field
        String status,
        String teacherFullName,
        int currentOccupancy,
        int maxCapacity,
        String projectFileName,
        List<StudentBasicResponse> enrolledStudents
) {}
