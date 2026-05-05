package pl.polsl.projectmanagement.dto;

public record LoginRequest(
        String email,
        String password
) {}