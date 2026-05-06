package pl.polsl.projectmanagement.dto;

import pl.polsl.projectmanagement.model.SectionStatus;

import java.util.UUID;

public record SectionResponse(
        UUID sectionId,
        String projectFileName,
        SectionStatus status,
        int maxCapacity,
        UUID topicId,
        UUID semesterId
) {}