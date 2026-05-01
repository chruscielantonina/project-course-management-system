package pl.polsl.projectmanagement.dto;

import java.util.UUID;

public record TopicResponse(
        UUID id,
        String name,
        String description,
        boolean isActive,
        String teacherName
) {}