package com.example.demo.controller;

import com.example.demo.dto.ClassScheduleDto;
import com.example.demo.dto.ClassScheduleRequestDto;
import com.example.demo.service.ProfessorScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminClassScheduleController {

    private final ProfessorScheduleService service;

    public AdminClassScheduleController(ProfessorScheduleService service) {
        this.service = service;
    }

    @GetMapping("/class-schedules")
    public ResponseEntity<List<ClassScheduleDto>> getClassSchedules(
            @RequestHeader("X-Username") String username,
            @RequestParam(required = false) Long deptId,
            @RequestParam(defaultValue = "2026-1") String semester) {
        return ResponseEntity.ok(service.getAdminSchedules(username, deptId, semester));
    }

    @PostMapping("/class-schedules")
    public ResponseEntity<ClassScheduleDto> createClassSchedule(
            @RequestHeader("X-Username") String username,
            @RequestBody ClassScheduleRequestDto req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createAdminSchedule(username, req));
    }

    @PutMapping("/class-schedules/{id}")
    public ResponseEntity<ClassScheduleDto> updateClassSchedule(
            @RequestHeader("X-Username") String username,
            @PathVariable Long id,
            @RequestBody ClassScheduleRequestDto req) {
        return ResponseEntity.ok(service.updateAdminSchedule(username, id, req));
    }

    @DeleteMapping("/class-schedules/{id}")
    public ResponseEntity<Void> deleteClassSchedule(
            @RequestHeader("X-Username") String username,
            @PathVariable Long id) {
        service.deleteAdminSchedule(username, id);
        return ResponseEntity.noContent().build();
    }
}
