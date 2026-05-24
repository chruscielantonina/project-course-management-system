package pl.polsl.projectmanagement.dto;

import java.time.LocalDate;
import java.util.UUID;

public record AttendanceResponse(
    UUID attendanceId,
    LocalDate date,
    String status
) {}
