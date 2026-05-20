package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.PostDto;
import com.example.demo.dto.ScheduleDto;
import com.example.demo.service.NoticeService;
import com.example.demo.service.PostService;
import com.example.demo.service.ScheduleService;
import com.example.demo.service.UniversityService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
public class MainController {

    private final NoticeService noticeService;
    private final PostService postService;
    private final ScheduleService scheduleService;
    private final UniversityService universityService;

    public MainController(NoticeService noticeService, PostService postService,
                          ScheduleService scheduleService, UniversityService universityService) {
        this.noticeService    = noticeService;
        this.postService      = postService;
        this.scheduleService  = scheduleService;
        this.universityService = universityService;
    }

    @GetMapping("/api/main")
    public Map<String, Object> apiMain(@RequestParam(required = false) Long deptId) {
        Long id = deptId != null ? deptId : 1L;
        Map<String, Object> result = new HashMap<>();
        List<NoticeDto>   notices   = noticeService.getNoticesByDept(id);
        List<PostDto>     posts     = postService.getPostsByDept(id);
        List<ScheduleDto> schedules = scheduleService.getSchedulesByDept(id);
        result.put("notices",   notices.subList(0, Math.min(5, notices.size())));
        result.put("posts",     posts.subList(0, Math.min(5, posts.size())));
        result.put("schedules", schedules);
        result.put("today", LocalDate.now()
            .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 EEEE", Locale.KOREAN)));
        result.put("selectedDeptName", universityService.findDeptName(id));
        return result;
    }

    @GetMapping("/api/faculty/main")
    public Map<String, Object> apiFacultyMain(@RequestParam(required = false) Long facultyId) {
        Long id = facultyId != null ? facultyId : 1L;
        Map<String, Object> result = new HashMap<>();
        List<NoticeDto>   notices   = noticeService.getNoticesByFaculty(id);
        List<PostDto>     posts     = postService.getPostsByFaculty(id);
        List<ScheduleDto> schedules = scheduleService.getSchedulesByFaculty(id);
        result.put("notices",   notices.subList(0, Math.min(5, notices.size())));
        result.put("posts",     posts.subList(0, Math.min(5, posts.size())));
        result.put("schedules", schedules);
        result.put("today", LocalDate.now()
            .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 EEEE", Locale.KOREAN)));
        result.put("selectedFacultyName", universityService.findFacultyName(id));
        return result;
    }
}
