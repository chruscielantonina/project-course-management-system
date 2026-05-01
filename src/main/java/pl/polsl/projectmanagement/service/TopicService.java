package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.polsl.projectmanagement.dto.CreateTopicRequest;
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

    public List<Topic> getAllTopics() {
        return topicRepository.findAll();
    }

    @Transactional
    public Topic addTopic(CreateTopicRequest requestDto) {

        Teacher teacher = teacherRepository.findById(requestDto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Topic topic = new Topic();
        topic.setToName(requestDto.getName());
        topic.setToDescription(requestDto.getDescription());
        topic.setActive(requestDto.isActive());
        topic.setTeacher(teacher);
        return topicRepository.save(topic);
    }

    @Transactional
    public Topic updateTopic(UUID topicId, CreateTopicRequest requestDto) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        topic.setToName(requestDto.getName());
        topic.setToDescription(requestDto.getDescription());
        topic.setActive(requestDto.isActive());

        return topicRepository.save(topic);
    }

    @Transactional
    public void deleteTopic(UUID topicId) {
        if (!topicRepository.existsById(topicId)) {
            throw new RuntimeException("Topic not found");
        }
        topicRepository.deleteById(topicId);
    }
}
