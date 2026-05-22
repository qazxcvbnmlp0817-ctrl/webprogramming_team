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

    private Long verifySchoolAndGetUnivId(String username) {
        if (username == null || username.isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 없음"));
        if (!"SCHOOL_ADMIN".equals(user.getAdminRole()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
        if (user.getUniversityId() == null || user.getUniversityId().isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학교 미연결");
        return Long.parseLong(user.getUniversityId());
    }

    private User verifySchool(String username) {
        if (username == null || username.isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 없음"));
        if (!"SCHOOL_ADMIN".equals(user.getAdminRole()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
        if (user.getUniversityId() == null || user.getUniversityId().isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학교 미연결");
        return user;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader(value = "X-Username", required = false) String username) {
        Long univId = verifySchoolAndGetUnivId(username);
        return ResponseEntity.ok(adminService.getSchoolStats(univId));
    }

    @GetMapping("/visitors")
    public ResponseEntity<List<Map<String, Object>>> getVisitors(
            @RequestHeader(value = "X-Username", required = false) String username) {
        Long univId = verifySchoolAndGetUnivId(username);
        return ResponseEntity.ok(adminService.getSchoolVisitorTrend(univId));
    }

    @GetMapping("/posts")
    public ResponseEntity<Map<String, Object>> getPosts(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(defaultValue = "0") int page) {
        Long univId = verifySchoolAndGetUnivId(username);
        return ResponseEntity.ok(adminService.getSchoolPosts(univId, page));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long postId) {
        verifySchoolAndGetUnivId(username);
        postService.delete(postId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @RequestHeader(value = "X-Username", required = false) String username) {
        User caller = verifySchool(username);
        return ResponseEntity.ok(adminService.getSchoolAdminUsers(caller.getUniversityId()));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateRole(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        verifySchoolAndGetUnivId(username);
        String role = body.get("role");
        if (role != null && !role.isBlank() && !"DEPT_ADMIN".equals(role))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "School Admin은 DEPT_ADMIN만 부여 가능");
        return ResponseEntity.ok(adminService.updateUserRole(id, role));
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveUser(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        verifySchoolAndGetUnivId(username);
        Boolean approved = body.get("approved");
        if (approved == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "approved 필드 필요");
        return ResponseEntity.ok(adminService.approveUser(id, approved));
    }
}
