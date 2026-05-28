package pl.polsl.projectmanagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.polsl.projectmanagement.dto.SemesterResponse;
import pl.polsl.projectmanagement.repository.SemesterRepository;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SemesterController {

    private final SemesterRepository semesterRepository;

    @GetMapping("/api/semesters")
    public ResponseEntity<List<SemesterResponse>> getAllSemesters() {
        List<SemesterResponse> response = semesterRepository.findAll().stream()
                .map(sem -> new SemesterResponse(
                        sem.getSemID(),
                        sem.getSemYear(),
                        sem.getSemField(),
                        sem.isCurrent()
                )).toList();

        return ResponseEntity.ok(response);
    }
}