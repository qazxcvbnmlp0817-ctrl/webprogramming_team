package com.example.demo.controller;

import com.example.demo.entity.CollegeSchool;
import com.example.demo.entity.FacultyGroup;
import com.example.demo.entity.User;
import com.example.demo.repository.CollegeSchoolRepository;
import com.example.demo.repository.FacultyGroupRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/faculty")
public class FacultyAdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final FacultyGroupRepository facultyGroupRepository;
    private final CollegeSchoolRepository collegeSchoolRepository;

    public FacultyAdminController(AdminService adminService,
                                   UserRepository userRepository,
                                   FacultyGroupRepository facultyGroupRepository,
                                   CollegeSchoolRepository collegeSchoolRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.facultyGroupRepository = facultyGroupRepository;
        this.collegeSchoolRepository = collegeSchoolRepository;
    }

    /**
     * SUPER_ADMIN  → requires facultyId param.
     * SCHOOL_ADMIN → requires facultyId param AND faculty must belong to user's university.
     * DEPT_ADMIN   → 403 (DEPT_ADMIN is below faculty scope).
     */
    private Long resolveFacultyId(String username, Long facultyIdParam) {
        if (username == null || username.isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 없음"));
        String role = user.getAdminRole();

        if ("SUPER_ADMIN".equals(role)) {
            if (facultyIdParam == null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "facultyId 파라미터 필요");
            return facultyIdParam;
        }
        if ("SCHOOL_ADMIN".equals(role)) {
            if (facultyIdParam == null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "facultyId 파라미터 필요");
            if (user.getUniversityId() == null || user.getUniversityId().isBlank())
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학교 미연결");
            FacultyGroup fg = facultyGroupRepository.findById(facultyIdParam)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학부 없음"));
            CollegeSchool cs = collegeSchoolRepository.findById(fg.getSchoolId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "단과 없음"));
            if (!cs.getUniversityId().equals(Long.parseLong(user.getUniversityId())))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 학교의 학부만 접근 가능");
            return facultyIdParam;
        }
        // DEPT_ADMIN intentionally blocked here.
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
    }

    private String resolveActor(String username) {
        return username != null ? username : "unknown";
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long facultyId) {
        return ResponseEntity.ok(adminService.getFacultyStats(resolveFacultyId(username, facultyId)));
    }

    @GetMapping("/visitors")
    public ResponseEntity<List<Map<String, Object>>> getVisitors(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long facultyId) {
        return ResponseEntity.ok(adminService.getFacultyVisitorTrend(resolveFacultyId(username, facultyId)));
    }

    @GetMapping("/posts")
    public ResponseEntity<Map<String, Object>> getPosts(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Long facultyId) {
        return ResponseEntity.ok(adminService.getFacultyPosts(resolveFacultyId(username, facultyId), page));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long postId,
            @RequestParam(required = false) Long facultyId) {
        Long id = resolveFacultyId(username, facultyId);
        return ResponseEntity.ok(adminService.deleteFacultyPost(postId, id, resolveActor(username)));
    }

    @GetMapping("/notices")
    public ResponseEntity<Map<String, Object>> getNotices(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Long facultyId) {
        return ResponseEntity.ok(adminService.getFacultyNotices(resolveFacultyId(username, facultyId), page));
    }

    @DeleteMapping("/notices/{noticeId}")
    public ResponseEntity<Map<String, Object>> deleteNotice(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long noticeId,
            @RequestParam(required = false) Long facultyId) {
        Long id = resolveFacultyId(username, facultyId);
        return ResponseEntity.ok(adminService.deleteFacultyNotice(noticeId, id, resolveActor(username)));
    }

    @PutMapping("/posts/{postId}/hidden")
    public ResponseEntity<Map<String, Object>> setPostHidden(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long postId,
            @RequestParam(required = false) Long facultyId,
            @RequestBody Map<String, Boolean> body) {
        resolveFacultyId(username, facultyId);
        boolean hidden = Boolean.TRUE.equals(body.get("hidden"));
        return ResponseEntity.ok(adminService.setPostHidden(postId, hidden, resolveActor(username)));
    }

    @PutMapping("/notices/{noticeId}/hidden")
    public ResponseEntity<Map<String, Object>> setNoticeHidden(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long noticeId,
            @RequestParam(required = false) Long facultyId,
            @RequestBody Map<String, Boolean> body) {
        resolveFacultyId(username, facultyId);
        boolean hidden = Boolean.TRUE.equals(body.get("hidden"));
        return ResponseEntity.ok(adminService.setNoticeHidden(noticeId, hidden, resolveActor(username)));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long facultyId) {
        return ResponseEntity.ok(adminService.getFacultyUsers(resolveFacultyId(username, facultyId)));
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<Map<String, Object>>> getPendingUsers(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long facultyId) {
        return ResponseEntity.ok(adminService.getFacultyPendingUsers(resolveFacultyId(username, facultyId)));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long userId,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) Long facultyId) {
        Long id = resolveFacultyId(username, facultyId);
        String status = body.get("status");
        if (status == null || status.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status 필드 필요");
        return ResponseEntity.ok(adminService.updateFacultyUserStatus(userId, status, id, resolveActor(username)));
    }

    @GetMapping("/monthly-stats")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyStats(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long facultyId) {
        return ResponseEntity.ok(adminService.getFacultyMonthlyStats(resolveFacultyId(username, facultyId)));
    }
}
