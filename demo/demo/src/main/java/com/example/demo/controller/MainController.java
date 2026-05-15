package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.PostDto;
import com.example.demo.dto.ScheduleDto;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Controller
public class MainController {

    @GetMapping("/api/main")
    @ResponseBody
    public Map<String, Object> apiMain(@RequestParam(required = false) Long deptId) {
        Long id = (deptId != null) ? deptId : 1L;
        Map<String, Object> result = new HashMap<>();
        List<com.example.demo.dto.NoticeDto>   notices   = com.example.demo.util.DummyDataHelper.getNoticesByDept(id);
        List<com.example.demo.dto.PostDto>     posts     = com.example.demo.util.DummyDataHelper.getPostsByDept(id);
        List<com.example.demo.dto.ScheduleDto> schedules = com.example.demo.util.DummyDataHelper.getSchedulesByDept(id);
        result.put("notices",   notices.subList(0, Math.min(5, notices.size())));
        result.put("posts",     posts.subList(0, Math.min(5, posts.size())));
        result.put("schedules", schedules);
        result.put("today", LocalDate.now()
            .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 EEEE", Locale.KOREAN)));
        result.put("selectedDeptName", com.example.demo.util.DummyDataHelper.findDeptName(id));
        return result;
    }
}
