package pl.polsl.projectmanagement.dto;

import java.util.UUID;

public record StudentBasicResponse(
        UUID studentId,    // The student's own profile ID
        UUID appUserId,    // The ID of the user account associated with the student
        String fullName
) {}
