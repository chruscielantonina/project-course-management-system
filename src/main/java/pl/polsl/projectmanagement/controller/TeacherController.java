package pl.polsl.projectmanagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.polsl.projectmanagement.model.Teacher;
import pl.polsl.projectmanagement.service.TeacherService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {
    private final TeacherService teacherService;

    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherService.getAllTeachers();
    }
    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getTeacherById(@PathVariable UUID id) {
        Optional<Teacher> teacher = teacherService.getTeacherById(id);

        return teacher.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Teacher> getTeacherByEmail(@PathVariable String email) {
        Optional<Teacher> teacher = teacherService.getTeacherByEmail(email);

        return teacher.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Teacher> createTeacher(@RequestBody Teacher teacher) {
        Teacher created = teacherService.createTeacher(teacher);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Teacher> updateTeacher(@PathVariable UUID id, @RequestBody Teacher teacher) {
        Teacher updated = teacherService.updateTeacher(id, teacher);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable UUID id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.noContent().build();
    }
}
