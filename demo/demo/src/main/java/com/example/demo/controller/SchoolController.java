package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.PostDto;
import com.example.demo.dto.ScheduleDto;
import com.example.demo.dto.UniversityDto;
import com.example.demo.service.NoticeService;
import com.example.demo.service.PostService;
import com.example.demo.service.ScheduleService;
import com.example.demo.service.UniversityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class SchoolController {

    private final NoticeService noticeService;
    private final PostService postService;
    private final ScheduleService scheduleService;
    private final UniversityService universityService;

    public SchoolController(NoticeService noticeService, PostService postService,
                            ScheduleService scheduleService, UniversityService universityService) {
        this.noticeService    = noticeService;
        this.postService      = postService;
        this.scheduleService  = scheduleService;
        this.universityService = universityService;
    }

    @GetMapping("/api/school/notices")
    public Map<String, Object> schoolNotices(@RequestParam(required = false) Long univId) {
        List<NoticeDto> list = noticeService.getNoticesByUniv(univId != null ? univId : 1L);
        if (list.isEmpty()) return Map.of("notices", list);
        return Map.of("featured", list.get(0), "notices", list);
    }

    @GetMapping("/api/school/posts")
    public Map<String, Object> schoolPosts(@RequestParam(required = false) Long univId) {
        List<PostDto> list = postService.getPostsByUniv(univId != null ? univId : 1L);
        if (list.isEmpty()) return Map.of("posts", list);
        return Map.of("featured", list.get(0), "posts", list);
    }

    @GetMapping("/api/school/schedules")
    public List<ScheduleDto> schoolSchedules(@RequestParam(required = false) Long univId) {
        return scheduleService.getSchedulesByUniv(univId != null ? univId : 1L);
    }

    @GetMapping("/api/school/info")
    public ResponseEntity<UniversityDto> schoolInfo(@RequestParam(required = false) Long univId) {
        return universityService.findById(univId != null ? univId : 1L)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
