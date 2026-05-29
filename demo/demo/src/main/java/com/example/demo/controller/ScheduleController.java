package com.example.demo.controller;

import com.example.demo.dto.ScheduleDto;
import com.example.demo.service.ScheduleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
