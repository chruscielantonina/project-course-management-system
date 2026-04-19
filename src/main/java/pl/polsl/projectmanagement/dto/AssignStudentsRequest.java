package pl.polsl.projectmanagement.dto;

import java.util.List;
import java.util.UUID;

public record AssignStudentsRequest(
        List<UUID> studentIds
) {}
