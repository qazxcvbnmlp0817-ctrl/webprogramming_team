package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UniversityRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/super")
public class SuperAdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;

    public SuperAdminController(AdminService adminService,
                                 UserRepository userRepository,
                                 UniversityRepository universityRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.universityRepository = universityRepository;
    }

    private void verifySuper(String username) {
        if (username == null || username.isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 없음"));
        if (!"SUPER_ADMIN".equals(user.getAdminRole()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader(value = "X-Username", required = false) String username) {
        verifySuper(username);
        return ResponseEntity.ok(adminService.getSuperStats());
    }

    @GetMapping("/schools")
    public ResponseEntity<List<Map<String, Object>>> getSchools(
            @RequestHeader(value = "X-Username", required = false) String username) {
        verifySuper(username);
        List<Map<String, Object>> schools = universityRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id",          u.getId(),
                        "name",        u.getName(),
                        "description", u.getDescription() != null ? u.getDescription() : ""))
                .collect(Collectors.toList());
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/visitors")
    public ResponseEntity<List<Map<String, Object>>> getVisitors(
            @RequestHeader(value = "X-Username", required = false) String username) {
        verifySuper(username);
        return ResponseEntity.ok(adminService.getGlobalVisitorTrend());
    }

    @GetMapping("/infra")
    public ResponseEntity<Map<String, Object>> getInfra(
            @RequestHeader(value = "X-Username", required = false) String username) {
        verifySuper(username);
        return ResponseEntity.ok(adminService.getInfraStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @RequestHeader(value = "X-Username", required = false) String username) {
        verifySuper(username);
        return ResponseEntity.ok(adminService.getAllAdminUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateRole(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        verifySuper(username);
        return ResponseEntity.ok(adminService.updateUserRole(id, body.get("role")));
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveUser(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        verifySuper(username);
        Boolean approved = body.get("approved");
        if (approved == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "approved 필드 필요");
        return ResponseEntity.ok(adminService.approveUser(id, approved));
    }
}
