package pl.polsl.projectmanagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.webmvc.autoconfigure.WebMvcProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pl.polsl.projectmanagement.dto.ChangeSectionRequest;
import pl.polsl.projectmanagement.model.Attendance;
import pl.polsl.projectmanagement.model.Grade;
import pl.polsl.projectmanagement.security.UserDetailsImpl;
import pl.polsl.projectmanagement.service.SectionService;
import pl.polsl.projectmanagement.service.StudentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final SectionService sectionService;

    @PostMapping("/me/sections/{sectionId}")
    public ResponseEntity<String> signUpForSection(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable UUID sectionId) {
        boolean success = studentService.signUpForSection(userDetails.getId(), sectionId);

        if (success) {
            return ResponseEntity.ok("Successfully signed up for the section.");
        } else {
            return ResponseEntity.badRequest().body("Error: Could not sign up for the section.");
        }
    }

    @DeleteMapping("/me/sections/{sectionId}")
    public ResponseEntity<Void> signOutFromSection(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable UUID sectionId) {
        if (studentService.signOutFromSection(userDetails.getId(), sectionId)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/me/sections/change")
    public ResponseEntity<String> changeSection(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody ChangeSectionRequest request) {

        boolean success = studentService.changeSection(
                userDetails.getId(),
                request.getOldSectionId(),
                request.getNewSectionId()
        );

        if (success) {
            return ResponseEntity.ok("Section has been changed successfully.");
        }
        return ResponseEntity.badRequest().body("Error changing section.");
    }

    @GetMapping("/me/attendance")
    public ResponseEntity<List<Attendance>> getAttendance(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Attendance> attendances = studentService.reviewAttendance(userDetails.getId());
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/me/grades")
    public ResponseEntity<List<Grade>> getAllGrades(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(studentService.reviewGrades(userDetails.getId()));
    }

    @GetMapping("/me/sections/{sectionId}/grades")
    public ResponseEntity<List<Grade>> getGradesForSection(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID sectionId) {

        List<Grade> grades = studentService.reviewGradesForSection(userDetails.getId(), sectionId);
        return ResponseEntity.ok(grades);
    }

    @PostMapping(value = "/me/sections/{sectionId}/project", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadProject(
            @PathVariable UUID sectionId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        sectionService.uploadSectionProject(sectionId, userDetails.getId(), file);

        return ResponseEntity.ok("Project ZIP file uploaded successfully!");
    }

    @GetMapping("/sections/{sectionId}/project/download")
    public ResponseEntity<Resource> downloadProject(@PathVariable UUID sectionId) {

        Resource resource = sectionService.downloadSectionProject(sectionId);

        String fileName = resource.getFilename();
        String prefixToRemove = "section_" + sectionId.toString() + "_";
        String cleanFileName = fileName.replace(prefixToRemove, "");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/zip"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + cleanFileName + "\"")
                .body(resource);
    }

    @DeleteMapping("/sections/{sectionId}/project")
    public ResponseEntity<String> deleteProject(
            @PathVariable UUID sectionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        sectionService.deleteSectionProject(sectionId, userDetails.getId());
        return ResponseEntity.ok("Project file has been successfully deleted.");
    }
}
