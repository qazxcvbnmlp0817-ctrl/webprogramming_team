package com.example.demo.controller;

import com.example.demo.dto.LectureOfferingDto;
import com.example.demo.dto.TimetableEntryDto;
import com.example.demo.service.StudentTimetableService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timetable")
public class StudentTimetableController {
    private final StudentTimetableService service;

    public StudentTimetableController(StudentTimetableService service) {
        this.service = service;
    }

    @GetMapping("/offerings")
    public List<LectureOfferingDto> offerings(
            @RequestParam(defaultValue = "2026-1") String semester,
            @RequestParam(required = false) String departmentName) {
        return service.getOfferings(semester, departmentName);
    }

    @GetMapping("/my")
    public List<TimetableEntryDto> my(
            @RequestHeader("X-Username") String username,
            @RequestParam(defaultValue = "2026-1") String semester) {
        return service.getMyTimetable(username, semester);
    }

    @PostMapping("/my")
    public TimetableEntryDto add(
            @RequestHeader("X-Username") String username,
            @RequestBody Map<String, Object> body) {
        Long offeringId = Long.valueOf(body.get("offeringId").toString());
        return service.add(username, offeringId);
    }

    @DeleteMapping("/my/{entryId}")
    public ResponseEntity<Void> remove(
            @RequestHeader("X-Username") String username,
            @PathVariable Long entryId) {
        service.remove(username, entryId);
        return ResponseEntity.noContent().build();
    }
}
