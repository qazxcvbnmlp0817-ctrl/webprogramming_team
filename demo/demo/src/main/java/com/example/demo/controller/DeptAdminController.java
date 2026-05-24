package com.example.demo.controller;

import com.example.demo.entity.CollegeSchool;
import com.example.demo.entity.Department;
import com.example.demo.entity.FacultyGroup;
import com.example.demo.entity.User;
import com.example.demo.repository.CollegeSchoolRepository;
import com.example.demo.repository.DepartmentRepository;
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
@RequestMapping("/api/admin/dept")
public class DeptAdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyGroupRepository facultyGroupRepository;
    private final CollegeSchoolRepository collegeSchoolRepository;

    public DeptAdminController(AdminService adminService,
                                UserRepository userRepository,
                                DepartmentRepository departmentRepository,
                                FacultyGroupRepository facultyGroupRepository,
                                CollegeSchoolRepository collegeSchoolRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.facultyGroupRepository = facultyGroupRepository;
        this.collegeSchoolRepository = collegeSchoolRepository;
    }

    /**
     * SUPER_ADMIN  → requires deptId param, returns it.
     * SCHOOL_ADMIN → requires deptId param AND dept must belong to user's university.
     * DEPT_ADMIN   → ignores deptId param, derives from (universityId, department name).
     */
    private Long resolveDeptId(String username, Long deptIdParam) {
        if (username == null || username.isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 없음"));
        String role = user.getAdminRole();

        if ("SUPER_ADMIN".equals(role)) {
            if (deptIdParam == null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "deptId 파라미터 필요");
            return deptIdParam;
        }
        if ("SCHOOL_ADMIN".equals(role)) {
            if (deptIdParam == null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "deptId 파라미터 필요");
            if (user.getUniversityId() == null || user.getUniversityId().isBlank())
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학교 미연결");
            Department d = departmentRepository.findById(deptIdParam)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학과 없음"));
            FacultyGroup fg = facultyGroupRepository.findById(d.getFacultyId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "학부 없음"));
            CollegeSchool cs = collegeSchoolRepository.findById(fg.getSchoolId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "단과 없음"));
            if (!cs.getUniversityId().equals(Long.parseLong(user.getUniversityId())))
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 학교의 학과만 접근 가능");
            return deptIdParam;
        }
        if ("DEPT_ADMIN".equals(role)) {
            if (user.getUniversityId() == null || user.getDepartment() == null)
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학과 정보 없음");
            Long resolved = adminService.resolveDeptIdByName(
                    Long.parseLong(user.getUniversityId()), user.getDepartment());
            if (resolved == null)
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학과 매칭 실패");
            return resolved;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
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
