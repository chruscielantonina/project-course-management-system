package pl.polsl.projectmanagement.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.util.UUID;

public interface FileStorageService {
    String storeProjectFile(UUID sectionId, MultipartFile file);
    Resource loadFileAsResource(String fileName);
    void deleteFile(String fileName);
}