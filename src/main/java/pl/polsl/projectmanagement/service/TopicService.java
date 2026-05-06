package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.polsl.projectmanagement.dto.CreateTopicRequest;
import pl.polsl.projectmanagement.dto.TopicResponse;
import pl.polsl.projectmanagement.model.Teacher;
import pl.polsl.projectmanagement.model.Topic;
import pl.polsl.projectmanagement.repository.TeacherRepository;
import pl.polsl.projectmanagement.repository.TopicRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final TeacherRepository teacherRepository;

    public List<TopicResponse> getAllTopics() {
        return topicRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public TopicResponse addTopic(UUID teacherId, CreateTopicRequest requestDto) {

        Teacher teacher = teacherRepository.findByAppUser_Id(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Topic topic = new Topic();
        topic.setToName(requestDto.getName());
        topic.setToDescription(requestDto.getDescription());
        topic.setActive(requestDto.isActive());
        topic.setTeacher(teacher);
        Topic savedTopic = topicRepository.save(topic);
        return mapToResponse(savedTopic);
    }

    @Transactional
    public TopicResponse updateTopic(UUID topicId, CreateTopicRequest requestDto) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        topic.setToName(requestDto.getName());
        topic.setToDescription(requestDto.getDescription());
        topic.setActive(requestDto.isActive());

        Topic updatedTopic = topicRepository.save(topic);
        return mapToResponse(updatedTopic);
    }

    @Transactional
    public void deleteTopic(UUID topicId) {
        if (!topicRepository.existsById(topicId)) {
            throw new RuntimeException("Topic not found");
        }
        topicRepository.deleteById(topicId);
    }

    private TopicResponse mapToResponse(Topic topic) {
        return new TopicResponse(
                topic.getToID(),
                topic.getToName(),
                topic.getToDescription(),
                topic.isActive(),
                topic.getTeacher().getTFirstName() + " " + topic.getTeacher().getTLastName()
        );
    }
}
