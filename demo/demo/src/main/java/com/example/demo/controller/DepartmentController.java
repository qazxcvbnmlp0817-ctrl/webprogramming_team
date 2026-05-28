package com.example.demo.controller;

import com.example.demo.dto.DepartmentDetailDto;
import com.example.demo.service.ProfessorScheduleService;
import com.example.demo.service.UniversityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class DepartmentController {

    private final UniversityService universityService;
    private final ProfessorScheduleService professorScheduleService;

    public DepartmentController(UniversityService universityService,
                                ProfessorScheduleService professorScheduleService) {
        this.universityService = universityService;
        this.professorScheduleService = professorScheduleService;
    }

    @GetMapping("/api/departments/{id}")
    public ResponseEntity<DepartmentDetailDto> getDepartmentDetail(@PathVariable Long id) {
        return universityService.getDepartmentDetail(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 학과별 수강 가능 과목 목록 (수업 선택 탭에서 사용)
    @GetMapping("/api/courses")
    public ResponseEntity<List<Map<String, Object>>> getCoursesByDept(
            @RequestParam Long deptId) {
        return ResponseEntity.ok(professorScheduleService.getCoursesByDept(deptId));
    }
}
