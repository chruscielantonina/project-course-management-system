package pl.polsl.projectmanagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.polsl.projectmanagement.dto.*;
import pl.polsl.projectmanagement.model.Section;
import pl.polsl.projectmanagement.model.Topic;
import pl.polsl.projectmanagement.service.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class TeacherController {

    private final TopicService topicService;
    private final SectionService sectionService;
    private final AttendanceService attendanceService;
    private final GradeService gradeService;

    @GetMapping("/api/topics")
    public ResponseEntity<List<Topic>> getAllTopics() {
        return ResponseEntity.ok(topicService.getAllTopics());
    }

    @PostMapping("/api/topics")
    public ResponseEntity<Topic> addTopic(@RequestBody CreateTopicRequest request) {
        return ResponseEntity.ok(topicService.addTopic(request));
    }

    @PutMapping("/api/topics/{id}")
    public ResponseEntity<Topic> updateTopic(@PathVariable UUID id, @RequestBody CreateTopicRequest request) {
        return ResponseEntity.ok(topicService.updateTopic(id, request));
    }

    @DeleteMapping("/api/topics/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable UUID id) {
        topicService.deleteTopic(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/teachers/{teacherId}/sections")
    public ResponseEntity<List<SectionDashboardResponse>> getDashboardSections(@PathVariable UUID teacherId) {
        List<SectionDashboardResponse> response = sectionService.getSectionsForDashboard(teacherId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/teachers/{teacherId}/sections")
    public ResponseEntity<Section> addSection(@PathVariable UUID teacherId, @RequestBody CreateSectionRequest request) {
        sectionService.addSection(teacherId, request);
        return ResponseEntity.status(201).build();
    }

    @DeleteMapping("/api/teachers/{teacherId}/sections/{sectionId}")
    public ResponseEntity<Void> deleteSection(@PathVariable UUID sectionId, @PathVariable UUID teacherId) {
        sectionService.deleteSection(sectionId, teacherId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/teachers/{teacherId}/sections/{sectionId}/students")
    public ResponseEntity<Void> assignStudents(
            @PathVariable UUID sectionId,
            @PathVariable UUID teacherId,
            @RequestBody AssignStudentsRequest request) {

        sectionService.assignStudentsToSection(sectionId, teacherId, request);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/api/students/available")
    public ResponseEntity<List<StudentBasicResponse>> getAvailableStudents() {
        return ResponseEntity.ok(sectionService.getAvailableStudents());
    }

    @PostMapping("/api/sections/{sectionId}/attendance")
    public ResponseEntity<Void> markAttendance(@PathVariable UUID sectionId, @RequestBody MarkAttendanceRequest request) {
        attendanceService.markAttendance(sectionId, request);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/api/sections/{sectionId}/attendance")
    public ResponseEntity<List<StudentAttendanceResponse>> getAttendanceForDate(
            @PathVariable UUID sectionId,
            @RequestParam LocalDate date) {

        List<StudentAttendanceResponse> response = attendanceService.getAttendanceList(sectionId, date);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/sections/{sectionId}/grades")
    public ResponseEntity<SectionGradesViewResponse> getGradesForSection(@PathVariable UUID sectionId) {
        return ResponseEntity.ok(gradeService.getGradesList(sectionId));
    }

    @PutMapping("/api/sections/{sectionId}/grades")
    public ResponseEntity<Void> saveGradesBulk(@PathVariable UUID sectionId, @RequestBody SaveGradesRequest request) {
        gradeService.saveGrades(sectionId, request);
        return ResponseEntity.ok().build();
    }
}