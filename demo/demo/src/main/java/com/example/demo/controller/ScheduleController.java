package com.example.demo.controller;

import com.example.demo.dto.ScheduleDto;
import com.example.demo.util.DummyDataHelper;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class ScheduleController {

    @GetMapping("/api/schedules")
    @ResponseBody
    public List<ScheduleDto> apiSchedules(@RequestParam(required = false) Long deptId) {
        return (deptId != null)
            ? DummyDataHelper.getSchedulesByDept(deptId)
            : DummyDataHelper.getSchedulesByDept(1L);
    }
}
