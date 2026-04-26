package pl.polsl.projectmanagement.dto;

import pl.polsl.projectmanagement.model.AttendanceStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record MarkAttendanceRequest(
        UUID sectionId,
        LocalDate date,
        List<StudentAttendanceRecordDto> attendance
) {
    public record StudentAttendanceRecordDto(
            UUID student,
            AttendanceStatus status
    ) {}
}
