package com.example.demo.controller;

import com.example.demo.dto.ClassScheduleDto;
import com.example.demo.service.ProfessorScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DeptPublicScheduleController {

    private final ProfessorScheduleService service;

    public DeptPublicScheduleController(ProfessorScheduleService service) {
        this.service = service;
    }

    @GetMapping("/api/dept/{deptId}/class-schedules")
    public ResponseEntity<List<ClassScheduleDto>> getDeptClassSchedules(
            @PathVariable Long deptId,
            @RequestParam(defaultValue = "2026-1") String semester) {
        return ResponseEntity.ok(service.getDeptSchedules(deptId, semester));
    }
}
