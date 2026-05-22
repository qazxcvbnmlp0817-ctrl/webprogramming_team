package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AdminService;
import com.example.demo.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/school")
public class SchoolAdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final PostService postService;

    public SchoolAdminController(AdminService adminService,
                                  UserRepository userRepository,
                                  PostService postService) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.postService = postService;
    }

    // Accepts SUPER_ADMIN (passes univId param) or SCHOOL_ADMIN (univId from profile)
    private Long resolveUnivId(String username, Long univIdParam) {
        if (username == null || username.isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 없음"));
        String role = user.getAdminRole();
        if ("SUPER_ADMIN".equals(role)) {
            if (univIdParam == null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "univId 파라미터 필요");
            return univIdParam;
        }
        if ("SCHOOL_ADMIN".equals(role)) {
            if (user.getUniversityId() == null || user.getUniversityId().isBlank())
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학교 미연결");
            return Long.parseLong(user.getUniversityId());
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
    }

    private String resolveActor(String username) {
        return username != null ? username : "unknown";
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolStats(id));
    }

    @GetMapping("/visitors")
    public ResponseEntity<List<Map<String, Object>>> getVisitors(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolVisitorTrend(id));
    }

    @GetMapping("/posts")
    public ResponseEntity<Map<String, Object>> getPosts(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolPosts(id, page));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long postId,
            @RequestParam(required = false) Long univId) {
        resolveUnivId(username, univId);
        postService.delete(postId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAdminUsers(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolAdminUsers(String.valueOf(id)));
    }

    @GetMapping("/all-users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolAllUsers(id));
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<Map<String, Object>>> getPendingUsers(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolPendingUsers(id));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) Long univId) {
        Long resolvedUnivId = resolveUnivId(username, univId);
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status 필드 필요");
        return ResponseEntity.ok(adminService.updateUserStatus(id, newStatus,
                resolveActor(username), resolvedUnivId));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, Object>>> getLogs(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getAdminLogs(id));
    }

    @GetMapping("/monthly-stats")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyStats(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolMonthlyStats(id));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateRole(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) Long univId) {
        resolveUnivId(username, univId);
        String role = body.get("role");
        if (role != null && !role.isBlank() && !"DEPT_ADMIN".equals(role))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "School Admin은 DEPT_ADMIN만 부여 가능");
        return ResponseEntity.ok(adminService.updateUserRole(id, role));
    }
}
