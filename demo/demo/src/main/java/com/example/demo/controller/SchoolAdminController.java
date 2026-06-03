package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.dto.SchoolPageContentDto;
import com.example.demo.service.AdminService;
import com.example.demo.service.SchoolContentService;
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
    private final SchoolContentService schoolContentService;
    private final UserRepository userRepository;

    public SchoolAdminController(AdminService adminService,
                                  SchoolContentService schoolContentService,
                                  UserRepository userRepository) {
        this.adminService = adminService;
        this.schoolContentService = schoolContentService;
        this.userRepository = userRepository;
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
        Long resolvedUnivId = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.deleteSchoolPost(postId, resolvedUnivId, resolveActor(username)));
    }

    @PutMapping("/posts/{postId}/hidden")
    public ResponseEntity<Map<String, Object>> setPostHidden(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long postId,
            @RequestParam(required = false) Long univId,
            @RequestBody Map<String, Boolean> body) {
        resolveUnivId(username, univId);
        boolean hidden = Boolean.TRUE.equals(body.get("hidden"));
        return ResponseEntity.ok(adminService.setPostHidden(postId, hidden, resolveActor(username)));
    }

    @PutMapping("/notices/{noticeId}/hidden")
    public ResponseEntity<Map<String, Object>> setNoticeHidden(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long noticeId,
            @RequestParam(required = false) Long univId,
            @RequestBody Map<String, Boolean> body) {
        resolveUnivId(username, univId);
        boolean hidden = Boolean.TRUE.equals(body.get("hidden"));
        return ResponseEntity.ok(adminService.setNoticeHidden(noticeId, hidden, resolveActor(username)));
    }

    @GetMapping("/notices")
    public ResponseEntity<Map<String, Object>> getNotices(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolNotices(id, page));
    }

    @DeleteMapping("/notices/{noticeId}")
    public ResponseEntity<Map<String, Object>> deleteNotice(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long noticeId,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.deleteSchoolNotice(noticeId, id, resolveActor(username)));
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

    @GetMapping("/content")
    public ResponseEntity<SchoolPageContentDto> getContent(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(schoolContentService.getContent(id));
    }

    @PutMapping("/content")
    public ResponseEntity<Void> saveContent(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId,
            @RequestBody SchoolPageContentDto dto) {
        Long id = resolveUnivId(username, univId);
        schoolContentService.saveContent(id, dto, resolveActor(username));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/content/section/{section}")
    public ResponseEntity<Void> saveContentSection(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId,
            @PathVariable String section,
            @RequestBody SchoolPageContentDto dto) {
        Long id = resolveUnivId(username, univId);
        schoolContentService.saveSection(id, section, dto, resolveActor(username));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateRole(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) Long univId) {
        Long resolvedUnivId = resolveUnivId(username, univId);
        String role = body.get("role");
        if (role != null && !role.isBlank() && "SUPER_ADMIN".equals(role))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "SUPER_ADMIN 역할은 부여할 수 없습니다");
        return ResponseEntity.ok(adminService.updateUserRole(id, role, resolveActor(username), resolvedUnivId));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartments(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getDeptsByUniv(id));
    }

    @GetMapping("/professors")
    public ResponseEntity<List<Map<String, Object>>> getProfessors(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getProfessorsByUniv(id));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, Object>>> getCourses(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getCoursesByUniv(id));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Map<String, Object>>> getAssignments(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getAssignmentsByUniv(id));
    }

    @PostMapping("/assignments")
    public ResponseEntity<Map<String, Object>> createAssignment(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId,
            @RequestBody Map<String, Long> body) {
        Long id          = resolveUnivId(username, univId);
        Long professorId = body.get("professorId");
        Long courseId    = body.get("courseId");
        Long deptId      = body.get("deptId");
        if (professorId == null || courseId == null || deptId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "professorId, courseId, deptId 필수");
        }
        List<Long> allowed = adminService.getDeptIdsForUnivPublic(id);
        if (!allowed.contains(deptId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 학과는 본 학교 소속이 아닙니다");
        }
        return ResponseEntity.ok(adminService.createAssignment(professorId, courseId, deptId));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long assignmentId,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        List<Long> deptIds = adminService.getDeptIdsForUnivPublic(id);
        adminService.deleteAssignment(assignmentId, deptIds);
        return ResponseEntity.noContent().build();
    }
}
