package pl.polsl.projectmanagement.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.polsl.projectmanagement.model.Section;
import pl.polsl.projectmanagement.model.SectionStatus;
import pl.polsl.projectmanagement.model.Teacher;
import pl.polsl.projectmanagement.model.Topic;
import pl.polsl.projectmanagement.repository.SectionRepository;
import pl.polsl.projectmanagement.repository.StudentSectionRepository;
import pl.polsl.projectmanagement.repository.TeacherRepository;
import pl.polsl.projectmanagement.repository.TopicRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final TopicRepository topicRepository;
    private final SectionRepository sectionRepository;
    private final StudentSectionRepository studentSectionRepository;

    @Transactional
    public Topic addTopic(String name, String description, boolean isActive, UUID teacherId) {

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Topic topic = new Topic();
        topic.setToName(name);
        topic.setToDescription(description);
        topic.setActive(isActive);
        topic.setTeacher(teacher);
        return topicRepository.save(topic);
    }

    @Transactional
    public Topic updateTopic(UUID topicId, String name, String description, boolean isActive) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        topic.setToName(name);
        topic.setToDescription(description);
        topic.setActive(isActive);

        return topicRepository.save(topic);
    }

    @Transactional
    public void deleteTopic(UUID topicId) {
        if(!topicRepository.existsById(topicId)) {
            throw new RuntimeException("Topic not found");
        }
        topicRepository.deleteById(topicId);
    }

    @Transactional
    public Section addSection(UUID teacherId, UUID topicId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        Section section = new Section();
        section.setTeacher(teacher);
        section.setTopic(topic);
        section.setSeState(SectionStatus.CLOSED);
        return sectionRepository.save(section);
    }

    @Transactional
    public boolean addGrade(UUID studentSectionId, String grade) {
        return studentSectionRepository.findById(studentSectionId).map(ss -> {
            ss.setGrade(grade);
            studentSectionRepository.save(ss);
            return true;
        }).orElse(false);
    }
}
