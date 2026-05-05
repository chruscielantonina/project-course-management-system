package pl.polsl.projectmanagement.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.polsl.projectmanagement.dto.CreateAccountRequest;
import pl.polsl.projectmanagement.dto.CreateSemesterRequest;
import pl.polsl.projectmanagement.dto.EditAccountRequest;
import pl.polsl.projectmanagement.dto.UpdateSemesterRequest;
import pl.polsl.projectmanagement.model.Semester;
import pl.polsl.projectmanagement.model.Student;
import pl.polsl.projectmanagement.model.Teacher;
import pl.polsl.projectmanagement.service.AdminService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(adminService.getAllTeachers());
    }

    @PostMapping("/accounts")
    public ResponseEntity<String> createAccount(@RequestBody CreateAccountRequest request) {
        boolean success = adminService.createAccount(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPassword(),
                request.getAccountType()
        );

        if (success) {
            return ResponseEntity.ok("The account has been created successfully.");
        } else {
            return ResponseEntity.badRequest().body("Error creating account.");
        }
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        if (adminService.deleteStudent(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable UUID id) {
        if (adminService.deleteTeacher(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<String> editStudent(@PathVariable UUID id, @RequestBody EditAccountRequest request) {
        boolean success = adminService.editStudent(
                id,
                request.getFirstName(),
                request.getLastName(),
                request.getEmail()
        );

        if (success) {
            return ResponseEntity.ok("Student details have been updated.");
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<String> editTeacher(@PathVariable UUID id, @RequestBody EditAccountRequest request) {
        boolean success = adminService.editTeacher(
                id,
                request.getFirstName(),
                request.getLastName(),
                request.getEmail()
        );

        if (success) {
            return ResponseEntity.ok("Teacher details have been updated.");
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/semesters")
    public ResponseEntity<Semester> createSemester(@RequestBody @Valid CreateSemesterRequest request) {
        return ResponseEntity.status(201).body(adminService.addSemester(request));
    }

    @GetMapping("/semesters")
    public ResponseEntity<List<Semester>> getAllSemesters() {
        return ResponseEntity.ok(adminService.getAllSemesters());
    }

    @PutMapping("/semesters/{id}")
    public ResponseEntity<Semester> updateSemester(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateSemesterRequest request) {

        return ResponseEntity.ok(adminService.updateSemester(id, request));
    }

    @DeleteMapping("/semesters/{id}")
    public ResponseEntity<Void> deleteSemester(@PathVariable UUID id) {
        adminService.deleteSemester(id);
        return ResponseEntity.noContent().build();
    }
}