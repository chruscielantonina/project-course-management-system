package pl.polsl.projectmanagement.dto;

import java.util.UUID;

public record JwtResponse(
        String token,
        UUID id,
        String email,
        String role
) {}