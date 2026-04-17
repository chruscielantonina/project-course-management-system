package pl.polsl.projectmanagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.polsl.projectmanagement.dto.ChangeSectionRequest;
import pl.polsl.projectmanagement.model.Attendance;
import pl.polsl.projectmanagement.service.StudentService;

import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;

    @PostMapping("/{studentId}/sections/{sectionId}")
    public ResponseEntity<String> signUpForSection(@PathVariable UUID studentId, @PathVariable UUID sectionId) {
        boolean success = studentService.signUpForSection(studentId, sectionId);

        if (success) {
            return ResponseEntity.ok("Successfully signed up for the section.");
        } else {
            return ResponseEntity.badRequest().body("Error: Could not sign up for the section.");
        }
    }

}
