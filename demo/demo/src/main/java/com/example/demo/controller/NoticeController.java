package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.NoticeWriteRequestDto;
import com.example.demo.service.NoticeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    // ── GET ──────────────────────────────────────────────────────────────────

    @GetMapping("/api/notices")
    public Map<String, Object> apiNotices(@RequestParam(required = false) Long deptId) {
        List<NoticeDto> notices = noticeService.getNoticesByDept(deptId != null ? deptId : 1L);
        if (notices.isEmpty()) return Map.of("notices", notices);
        return Map.of("featured", notices.get(0), "notices", notices);
    }

    @GetMapping("/api/faculty/notices")
    public Map<String, Object> facultyNotices(@RequestParam(required = false) Long facultyId) {
        List<NoticeDto> notices = noticeService.getNoticesByFaculty(facultyId != null ? facultyId : 1L);
        if (notices.isEmpty()) return Map.of("notices", notices);
        return Map.of("featured", notices.get(0), "notices", notices);
    }

    @GetMapping("/api/univ/notices")
    public Map<String, Object> univNotices(@RequestParam(required = false) Long univId) {
        List<NoticeDto> notices = noticeService.getNoticesByUniv(univId != null ? univId : 1L);
        if (notices.isEmpty()) return Map.of("notices", notices);
        return Map.of("featured", notices.get(0), "notices", notices);
    }

    // ── POST ─────────────────────────────────────────────────────────────────

    @PostMapping("/api/notices")
    public ResponseEntity<Map<String, Object>> createDeptNotice(@RequestBody NoticeWriteRequestDto req) {
        req.setScopeType("dept");
        noticeService.create(req);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/api/faculty/notices")
    public ResponseEntity<Map<String, Object>> createFacultyNotice(@RequestBody NoticeWriteRequestDto req) {
        req.setScopeType("faculty");
        noticeService.create(req);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/api/univ/notices")
    public ResponseEntity<Map<String, Object>> createUnivNotice(@RequestBody NoticeWriteRequestDto req) {
        req.setScopeType("univ");
        noticeService.create(req);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
