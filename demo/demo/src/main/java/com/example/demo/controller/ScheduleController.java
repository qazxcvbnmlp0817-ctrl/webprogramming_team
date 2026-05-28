package com.example.demo.controller;

import com.example.demo.dto.CourseScheduleCreateDto;
import com.example.demo.dto.ScheduleDto;
import com.example.demo.service.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/api/schedules")
    public List<ScheduleDto> apiSchedules(@RequestParam(required = false) Long deptId) {
        return scheduleService.getSchedulesByDept(deptId != null ? deptId : 1L);
    }

    @GetMapping("/api/faculty/schedules")
    public List<ScheduleDto> facultySchedules(@RequestParam(required = false) Long facultyId) {
        return scheduleService.getSchedulesByFaculty(facultyId != null ? facultyId : 1L);
    }

    @GetMapping("/api/univ/schedules")
    public List<ScheduleDto> univSchedules(@RequestParam(required = false) Long univId) {
        return scheduleService.getSchedulesByUniv(univId != null ? univId : 1L);
    }

    // 교수/조교: 담당 과목에 일정 등록
    @PostMapping("/api/professor/schedules")
    public ResponseEntity<ScheduleDto> createCourseSchedule(
            @RequestHeader("X-Username") String username,
            @RequestBody CourseScheduleCreateDto req) {
        return ResponseEntity.ok(scheduleService.createCourseSchedule(username, req));
    }

    // 학생: 수강과목의 교수 등록 일정 조회
    @GetMapping("/api/student/course-events")
    public ResponseEntity<List<ScheduleDto>> getStudentCourseEvents(
            @RequestHeader("X-Username") String username,
            @RequestParam(defaultValue = "2025-1") String semester) {
        return ResponseEntity.ok(scheduleService.getStudentCourseEvents(username, semester));
    }

    // 조교: 소속 학과 과목 목록 조회 (일정 등록 모달용)
    @GetMapping("/api/assistant/courses")
    public ResponseEntity<List<Map<String, Object>>> getAssistantCourses(
            @RequestHeader("X-Username") String username) {
        return ResponseEntity.ok(scheduleService.getAssistantCourses(username));
    }

    // 교수/조교: 학과 전체 공개 수업 일정 등록
    @PostMapping("/api/professor/dept-schedules")
    public ResponseEntity<ScheduleDto> createDeptCourseSchedule(
            @RequestHeader("X-Username") String username,
            @RequestBody CourseScheduleCreateDto req) {
        return ResponseEntity.ok(scheduleService.createDeptCourseSchedule(username, req));
    }

    // 학생: 소속 학과 교수 등록 일정 조회
    @GetMapping("/api/student/dept-events")
    public ResponseEntity<List<ScheduleDto>> getStudentDeptEvents(
            @RequestParam Long deptId) {
        return ResponseEntity.ok(scheduleService.getStudentDeptCourseEvents(deptId));
    }
}
