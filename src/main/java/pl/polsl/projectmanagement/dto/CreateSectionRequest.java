package pl.polsl.projectmanagement.dto;

import java.util.UUID;

public record CreateSectionRequest(
        UUID topicId,
        UUID semesterId,
        int maxCapacity
) {}