package pl.polsl.projectmanagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.polsl.projectmanagement.dto.*;
import pl.polsl.projectmanagement.model.Section;
import pl.polsl.projectmanagement.model.Topic;
import pl.polsl.projectmanagement.repository.SectionRepository;
import pl.polsl.projectmanagement.repository.TopicRepository;
import pl.polsl.projectmanagement.service.SectionService;
import pl.polsl.projectmanagement.service.TeacherService;
import pl.polsl.projectmanagement.service.TopicService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {
    private final TeacherService teacherService;
    private final TopicService topicService;
    private final SectionService sectionService;

    @GetMapping("/topics")
    public ResponseEntity<List<Topic>> getAllTopics() {
        return ResponseEntity.ok(topicService.getAllTopics());
    }

    @PostMapping("/topics")
    public ResponseEntity<Topic> addTopic(@RequestBody CreateTopicRequest request) {
        return ResponseEntity.ok(topicService.addTopic(request));
    }

    @PutMapping("/topics/{id}")
    public ResponseEntity<Topic> updateTopic(@PathVariable UUID id, @RequestBody CreateTopicRequest request) {
        return ResponseEntity.ok(topicService.updateTopic(id, request));
    }

    @DeleteMapping("/topics/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable UUID id) {
        topicService.deleteTopic(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{teacherId}/sections")
    public ResponseEntity<List<SectionDashboardResponse>> getDashboardSections(@PathVariable UUID teacherId) {
        List<SectionDashboardResponse> response = sectionService.getSectionsForDashboard(teacherId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{teacherId}/sections")
    public ResponseEntity<Section> addSection(@PathVariable UUID teacherId, @RequestBody CreateSectionRequest request) {
        sectionService.addSection(teacherId, request);
        return ResponseEntity.status(201).build();
    }

    @DeleteMapping("/{teacherId}/sections/{sectionId}")
    public ResponseEntity<Void> deleteSection(@PathVariable UUID sectionId, @PathVariable UUID teacherId) {
        sectionService.deleteSection(sectionId, teacherId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teacherId}/sections/{sectionId}/students")
    public ResponseEntity<Void> assignStudents(
            @PathVariable UUID sectionId,
            @PathVariable UUID teacherId,
            @RequestBody AssignStudentsRequest request) {

        sectionService.assignStudentsToSection(sectionId, teacherId, request);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/available")
    public ResponseEntity<List<StudentBasicResponse>> getAvailableStudents() {
        return ResponseEntity.ok(sectionService.getAvailableStudents());
    }

    @PostMapping("/attendance")
    public ResponseEntity<Void> markAttendance(@RequestBody MarkAttendanceRequest request) {
        teacherService.markAttendance(request);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/{sectionId}/attendance")
    public ResponseEntity<List<StudentAttendanceResponse>> getAttendanceForDate(
            @PathVariable UUID sectionId,
            @RequestParam LocalDate date) {

        List<StudentAttendanceResponse> response = teacherService.getAttendanceList(sectionId, date);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{sectionId}/grades")
    public ResponseEntity<SectionGradesViewResponse> getGradesForSection(@PathVariable UUID sectionId) {
        return ResponseEntity.ok(teacherService.getGradesList(sectionId));
    }

    @PutMapping("/grades")
    public ResponseEntity<Void> saveGradesBulk(@RequestBody SaveGradesRequest request) {
        teacherService.saveGrades(request);
        return ResponseEntity.ok().build();
    }
}
