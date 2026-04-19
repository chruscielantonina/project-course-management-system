package pl.polsl.projectmanagement.dto;

import java.util.UUID;

public record StudentBasicResponse(
        UUID studentId,
        String fullName
) {}