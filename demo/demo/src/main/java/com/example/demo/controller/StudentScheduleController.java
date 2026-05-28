package com.example.demo.controller;

import com.example.demo.dto.ClassScheduleDto;
import com.example.demo.service.ProfessorScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// 학생 전용: 수강신청 기반 시간표 조회 + 수강신청 관리
@RestController
@RequestMapping("/api/student")
public class StudentScheduleController {

    private final ProfessorScheduleService service;

    public StudentScheduleController(ProfessorScheduleService service) {
        this.service = service;
    }

    // 내 시간표 조회 — 교수가 등록/수정/삭제한 내용이 즉시 반영됨
    @GetMapping("/class-schedules")
    public ResponseEntity<List<ClassScheduleDto>> getMySchedules(
            @RequestHeader("X-Username") String username,
            @RequestParam(defaultValue = "2025-1") String semester) {
        return ResponseEntity.ok(service.getStudentSchedules(username, semester));
    }

    // 수강신청 목록 조회
    @GetMapping("/enrollments")
    public ResponseEntity<List<Map<String, Object>>> getEnrollments(
            @RequestHeader("X-Username") String username,
            @RequestParam(defaultValue = "2025-1") String semester) {
        return ResponseEntity.ok(service.getMyEnrollments(username, semester));
    }

    // 수강신청
    @PostMapping("/enrollments")
    public ResponseEntity<Map<String, Object>> enroll(
            @RequestHeader("X-Username") String username,
            @RequestBody Map<String, Object> body) {
        Long courseId = Long.valueOf(body.get("courseId").toString());
        String semester = body.getOrDefault("semester", "2025-1").toString();
        return ResponseEntity.ok(service.enroll(username, courseId, semester));
    }

    // 수강신청 취소
    @DeleteMapping("/enrollments/{enrollmentId}")
    public ResponseEntity<Void> cancelEnrollment(
            @RequestHeader("X-Username") String username,
            @PathVariable Long enrollmentId) {
        service.cancelEnrollment(username, enrollmentId);
        return ResponseEntity.noContent().build();
    }
}
