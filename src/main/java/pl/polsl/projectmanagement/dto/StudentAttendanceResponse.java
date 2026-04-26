package pl.polsl.projectmanagement.dto;

import java.util.UUID;
import pl.polsl.projectmanagement.model.AttendanceStatus;

public record StudentAttendanceResponse(
        UUID studentId,
        String fullName,
        AttendanceStatus status
) {}