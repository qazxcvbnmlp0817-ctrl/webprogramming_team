package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.PostDto;
import com.example.demo.dto.ScheduleDto;
import com.example.demo.dto.UniversityDto;
import com.example.demo.util.DummyDataHelper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

/**
 * 대학(university) 전체 범위의 데이터 API.
 * DB 연동 시 각 메서드의 DummyDataHelper 호출을 Service 호출로 교체.
 */
@Controller
public class SchoolController {

    @GetMapping("/api/school/notices")
    @ResponseBody
    public Map<String, Object> schoolNotices(@RequestParam(required = false) Long univId) {
        Long id = univId != null ? univId : 1L;
        List<NoticeDto> list = DummyDataHelper.getUniversityNotices(id);
        if (list.isEmpty()) return Map.of("notices", list);
        return Map.of("featured", list.get(0), "notices", list);
    }

    @GetMapping("/api/school/posts")
    @ResponseBody
    public Map<String, Object> schoolPosts(@RequestParam(required = false) Long univId) {
        Long id = univId != null ? univId : 1L;
        List<PostDto> list = DummyDataHelper.getUniversityPosts(id);
        if (list.isEmpty()) return Map.of("posts", list);
        return Map.of("featured", list.get(0), "posts", list);
    }

    @GetMapping("/api/school/schedules")
    @ResponseBody
    public List<ScheduleDto> schoolSchedules(@RequestParam(required = false) Long univId) {
        Long id = univId != null ? univId : 1L;
        return DummyDataHelper.getUniversitySchedules(id);
    }

    @GetMapping("/api/school/info")
    @ResponseBody
    public ResponseEntity<UniversityDto> schoolInfo(@RequestParam(required = false) Long univId) {
        Long id = univId != null ? univId : 1L;
        UniversityDto univ = DummyDataHelper.findUniversity(id);
        if (univ == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(univ);
    }
}
