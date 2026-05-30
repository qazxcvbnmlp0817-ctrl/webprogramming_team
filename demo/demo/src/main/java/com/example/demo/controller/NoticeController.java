package com.example.demo.controller;

import com.example.demo.dto.NoticeCommentDto;
import com.example.demo.dto.NoticeCommentWriteRequestDto;
import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.NoticeWriteRequestDto;
import com.example.demo.service.AdminService;
import com.example.demo.service.NoticeCommentService;
import com.example.demo.service.NoticeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class NoticeController {

    private final NoticeService noticeService;
    private final NoticeCommentService noticeCommentService;
    private final AdminService adminService;

    public NoticeController(NoticeService noticeService,
                            NoticeCommentService noticeCommentService,
                            AdminService adminService) {
        this.noticeService        = noticeService;
        this.noticeCommentService = noticeCommentService;
        this.adminService         = adminService;
    }

    // ── GET ──────────────────────────────────────────────────────────────────

    @GetMapping("/api/notices/{id}")
    public ResponseEntity<?> getNotice(@PathVariable Long id) {
        return noticeService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

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

    @PutMapping("/api/notices/{id}")
    public ResponseEntity<?> updateNotice(@PathVariable Long id,
                                          @RequestBody NoticeWriteRequestDto req) {
        noticeService.update(id, req);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/api/notices/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id) {
        noticeService.delete(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/api/notices/{id}/hidden")
    public ResponseEntity<Map<String, Object>> setNoticeHidden(
            @PathVariable Long id,
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestBody Map<String, Boolean> body) {
        boolean hidden = Boolean.TRUE.equals(body.get("hidden"));
        return ResponseEntity.ok(adminService.setNoticeHidden(id, hidden, username != null ? username : "unknown"));
    }

    // ── 댓글 ─────────────────────────────────────────────────────────────────

    @GetMapping("/api/notices/{id}/comments")
    public ResponseEntity<List<NoticeCommentDto>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(noticeCommentService.getByNoticeId(id));
    }

    @PostMapping("/api/notices/{id}/comments")
    public ResponseEntity<NoticeCommentDto> addComment(@PathVariable Long id,
                                                        @RequestBody NoticeCommentWriteRequestDto req) {
        return ResponseEntity.ok(noticeCommentService.add(id, req));
    }

    @PutMapping("/api/notices/{id}/comments/{commentId}")
    public ResponseEntity<NoticeCommentDto> updateComment(@PathVariable Long id,
                                                           @PathVariable Long commentId,
                                                           @RequestBody NoticeCommentWriteRequestDto req) {
        try { return ResponseEntity.ok(noticeCommentService.update(id, commentId, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().build(); }
    }

    @DeleteMapping("/api/notices/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id,
                                               @PathVariable Long commentId,
                                               @RequestParam(required = false) String username,
                                               @RequestParam(required = false) String memberType) {
        try {
            noticeCommentService.delete(id, commentId, username, memberType);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) { return ResponseEntity.status(403).build(); }
    }
}
