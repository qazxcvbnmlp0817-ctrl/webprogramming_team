package com.example.demo.controller;

import com.example.demo.dto.ClassScheduleDto;
import com.example.demo.dto.ClassScheduleRequestDto;
import com.example.demo.service.ProfessorScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// 교수 전용 수업 시간표 CRUD
@RestController
@RequestMapping("/api/professor")
public class ProfessorScheduleController {

    private final ProfessorScheduleService service;

    public ProfessorScheduleController(ProfessorScheduleService service) {
        this.service = service;
    }

    // 내 담당 강좌 배정 조회
    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getMyAssignments(
            @RequestHeader("X-Username") String username) {
        return ResponseEntity.ok(service.getProfessorAssignments(username));
    }

    // 내 수업 시간표 전체 조회
    @GetMapping("/class-schedules")
    public ResponseEntity<List<ClassScheduleDto>> getMySchedules(
            @RequestHeader("X-Username") String username,
            @RequestParam(required = false) String semester) {
        List<ClassScheduleDto> result = (semester != null)
                ? service.getMySchedulesBySemester(username, semester)
                : service.getMySchedules(username);
        return ResponseEntity.ok(result);
    }

    // 수업 시간표 등록
    @PostMapping("/class-schedules")
    public ResponseEntity<ClassScheduleDto> createSchedule(
            @RequestHeader("X-Username") String username,
            @RequestBody ClassScheduleRequestDto req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createSchedule(username, req));
    }

    // 수업 시간표 수정 — 수강생 시간표에 즉시 반영
    @PutMapping("/class-schedules/{id}")
    public ResponseEntity<ClassScheduleDto> updateSchedule(
            @RequestHeader("X-Username") String username,
            @PathVariable Long id,
            @RequestBody ClassScheduleRequestDto req) {
        return ResponseEntity.ok(service.updateSchedule(username, id, req));
    }

    // 수업 시간표 삭제 — 수강생 시간표에서 즉시 제거
    @DeleteMapping("/class-schedules/{id}")
    public ResponseEntity<Void> deleteSchedule(
            @RequestHeader("X-Username") String username,
            @PathVariable Long id) {
        service.deleteSchedule(username, id);
        return ResponseEntity.noContent().build();
    }
}
