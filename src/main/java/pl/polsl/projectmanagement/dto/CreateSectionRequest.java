package pl.polsl.projectmanagement.dto;

import pl.polsl.projectmanagement.model.SectionStatus;

import java.util.UUID;

public record CreateSectionRequest(
        UUID topicId,
        SectionStatus sectionStatus,
        int maxCapacity
) {}