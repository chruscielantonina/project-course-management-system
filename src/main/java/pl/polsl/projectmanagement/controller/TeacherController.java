package pl.polsl.projectmanagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.polsl.projectmanagement.dto.CreateTopicRequest;
import pl.polsl.projectmanagement.model.Section;
import pl.polsl.projectmanagement.model.Teacher;
import pl.polsl.projectmanagement.model.Topic;
import pl.polsl.projectmanagement.repository.TopicRepository;
import pl.polsl.projectmanagement.service.TeacherService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {
    private final TeacherService teacherService;
    private final TopicRepository topicRepository;

    @GetMapping("/topics")
    public ResponseEntity<List<Topic>> getAllTopics() {
        return ResponseEntity.ok(teacherService.getAllTopics());
    }

    @PostMapping("/topics")
    public ResponseEntity<Topic> addTopic(@RequestBody CreateTopicRequest request) {
        return ResponseEntity.ok(teacherService.addTopic(request.getName(),
                                                         request.getDescription(),
                                                         request.isActive(),
                                                         request.getTeacherId()));
    }

    @PutMapping("/topics/{id}")
    public ResponseEntity<Topic> updateTopic(@PathVariable UUID id, @RequestBody CreateTopicRequest request) {
        return ResponseEntity.ok(teacherService.updateTopic(id,
                                                            request.getName(),
                                                            request.getDescription(),
                                                            request.isActive()));
    }

    @DeleteMapping("/topics")
    public ResponseEntity<Void> deleteTopic(@PathVariable UUID id) {
        teacherService.deleteTopic(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teacherId}/sections/{topicId}")
    public ResponseEntity<Section> addSection(@PathVariable UUID teacherId, @PathVariable UUID topicId) {
        return ResponseEntity.ok(teacherService.addSection(teacherId, topicId));
    }

    @PatchMapping("/grades/{studentSectionId}")
    public ResponseEntity<Void> addGrade(@PathVariable UUID studentSectionId, @RequestParam String grade) {
        if (teacherService.addGrade(studentSectionId, grade)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
