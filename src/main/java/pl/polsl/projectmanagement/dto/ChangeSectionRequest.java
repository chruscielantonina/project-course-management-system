package pl.polsl.projectmanagement.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ChangeSectionRequest {
    private UUID oldSectionId;
    private UUID newSectionId;
}
