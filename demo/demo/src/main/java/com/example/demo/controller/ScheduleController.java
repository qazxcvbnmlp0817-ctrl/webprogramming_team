package com.example.demo.controller;

import com.example.demo.dto.ScheduleCreateRequest;
import com.example.demo.dto.ScheduleDto;
import com.example.demo.service.ScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    // POST /api/schedules — 일정 생성 (학생/교수/조교/관리자)
    @PostMapping
    public ResponseEntity<ScheduleDto> create(
            @RequestHeader("X-Username") String username,
            @RequestBody ScheduleCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(scheduleService.createSchedule(username, req));
    }

    // GET /api/schedules/my — 내 일정 조회
    @GetMapping("/my")
    public ResponseEntity<List<ScheduleDto>> getMySchedules(
            @RequestHeader("X-Username") String username) {
        return ResponseEntity.ok(scheduleService.getMySchedules(username));
    }

    // PUT /api/schedules/{id} — 일정 수정
    @PutMapping("/{id}")
    public ResponseEntity<ScheduleDto> update(
            @RequestHeader("X-Username") String username,
            @PathVariable Long id,
            @RequestBody ScheduleCreateRequest req) {
        return ResponseEntity.ok(scheduleService.updateSchedule(username, id, req));
    }

    // PATCH /api/schedules/{id}/complete — 완료 토글
    @PatchMapping("/{id}/complete")
    public ResponseEntity<ScheduleDto> toggleComplete(
            @RequestHeader("X-Username") String username,
            @PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.toggleComplete(username, id));
    }

    // DELETE /api/schedules/{id} — 일정 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader("X-Username") String username,
            @PathVariable Long id) {
        scheduleService.deleteSchedule(username, id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/schedules/dept?deptId=X — 레거시 학과 공지 조회 (MainPage 등)
    @GetMapping("/dept")
    public ResponseEntity<List<ScheduleDto>> deptSchedules(
            @RequestParam(required = false) Long deptId) {
        return ResponseEntity.ok(scheduleService.getSchedulesByDept(deptId != null ? deptId : 1L));
    }

    // GET /api/schedules?deptId=X — 하위 호환 레거시 (기존 프론트 코드 호환)
    @GetMapping
    public ResponseEntity<List<ScheduleDto>> legacyDeptSchedules(
            @RequestParam(required = false) Long deptId) {
        return ResponseEntity.ok(scheduleService.getSchedulesByDept(deptId != null ? deptId : 1L));
    }
}
