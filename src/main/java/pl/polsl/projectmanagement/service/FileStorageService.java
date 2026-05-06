package pl.polsl.projectmanagement.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

public interface FileStorageService {
    String storeProjectFile(UUID sectionId, MultipartFile file);
}