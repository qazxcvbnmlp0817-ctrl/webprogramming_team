package com.example.demo.controller;

import com.example.demo.service.AdminService;
import com.example.demo.service.DeptAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dept")
public class DeptAdminController {

    private final AdminService adminService;
    private final DeptAuthService deptAuthService;

    public DeptAdminController(AdminService adminService,
                                DeptAuthService deptAuthService) {
        this.adminService = adminService;
        this.deptAuthService = deptAuthService;
    }

    private Long resolveDeptId(String username, Long deptIdParam) {
        return deptAuthService.resolveDeptId(username, deptIdParam);
    }

    private String resolveActor(String username) {
        return username != null ? username : "unknown";
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long deptId) {
        return ResponseEntity.ok(adminService.getDeptStats(resolveDeptId(username, deptId)));
    }

    @GetMapping("/visitors")
    public ResponseEntity<List<Map<String, Object>>> getVisitors(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long deptId) {
        return ResponseEntity.ok(adminService.getDeptVisitorTrend(resolveDeptId(username, deptId)));
    }

    @GetMapping("/posts")
    public ResponseEntity<Map<String, Object>> getPosts(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Long deptId) {
        return ResponseEntity.ok(adminService.getDeptPosts(resolveDeptId(username, deptId), page));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long postId,
            @RequestParam(required = false) Long deptId) {
        Long id = resolveDeptId(username, deptId);
        return ResponseEntity.ok(adminService.deleteDeptPost(postId, id, resolveActor(username)));
    }

    @GetMapping("/notices")
    public ResponseEntity<Map<String, Object>> getNotices(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Long deptId) {
        return ResponseEntity.ok(adminService.getDeptNotices(resolveDeptId(username, deptId), page));
    }

    @DeleteMapping("/notices/{noticeId}")
    public ResponseEntity<Map<String, Object>> deleteNotice(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long noticeId,
            @RequestParam(required = false) Long deptId) {
        Long id = resolveDeptId(username, deptId);
        return ResponseEntity.ok(adminService.deleteDeptNotice(noticeId, id, resolveActor(username)));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long deptId) {
        return ResponseEntity.ok(adminService.getDeptUsers(resolveDeptId(username, deptId)));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long userId,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) Long deptId) {
        Long id = resolveDeptId(username, deptId);
        String status = body.get("status");
        if (status == null || status.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status 필드 필요");
        return ResponseEntity.ok(adminService.updateDeptUserStatus(userId, status, id, resolveActor(username)));
    }

    @GetMapping("/monthly-stats")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyStats(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long deptId) {
        return ResponseEntity.ok(adminService.getDeptMonthlyStats(resolveDeptId(username, deptId)));
    }

    @GetMapping("/professors")
    public ResponseEntity<List<Map<String, Object>>> getProfessors(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long deptId) {
        Long id = resolveDeptId(username, deptId);
        return ResponseEntity.ok(adminService.getProfessorsByDept(id));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getCourses(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long deptId) {
        Long id = resolveDeptId(username, deptId);
        return ResponseEntity.ok(adminService.getCoursesByDept(id));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getAssignments(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long deptId) {
        Long id = resolveDeptId(username, deptId);
        return ResponseEntity.ok(adminService.getAssignmentsByDept(id));
    }

    @PostMapping("/assignments")
    public ResponseEntity<Map<String, Object>> createAssignment(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long deptId,
            @RequestBody Map<String, Long> body) {
        Long id = resolveDeptId(username, deptId);
        Long professorId = body.get("professorId");
        Long courseId    = body.get("courseId");
        if (professorId == null || courseId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "professorId, courseId 필수");
        }
        return ResponseEntity.ok(adminService.createAssignment(professorId, courseId, id));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long assignmentId,
            @RequestParam(required = false) Long deptId) {
        Long id = resolveDeptId(username, deptId);
        adminService.deleteAssignment(assignmentId, List.of(id));
        return ResponseEntity.noContent().build();
    }
}
