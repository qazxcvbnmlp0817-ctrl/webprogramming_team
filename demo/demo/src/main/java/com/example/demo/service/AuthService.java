package com.example.demo.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.dto.FindIdRequestDto;
import com.example.demo.dto.FindPasswordRequestDto;
import com.example.demo.dto.LoginRequestDto;
import com.example.demo.dto.SignupRequestDto;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final AdminService adminService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, AdminService adminService) {
        this.userRepository = userRepository;
        this.adminService = adminService;
    }

    public Map<String, Object> login(LoginRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return response;
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            response.put("success", false);
            response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return response;
        }

        if (!user.getMemberType().equals(request.getMemberType())) {
            response.put("success", false);
            response.put("message", "회원 유형이 일치하지 않습니다.");
            return response;
        }

        String status = user.getStatus() != null ? user.getStatus() : "ACTIVE";
        if ("PENDING_APPROVAL".equals(status)) {
            response.put("success", false);
            response.put("message", "관리자 승인 후 이용 가능합니다.");
            return response;
        }
        if ("SUSPENDED".equals(status)) {
            response.put("success", false);
            response.put("message", "계정이 정지되었습니다.");
            return response;
        }
        if ("DELETED".equals(status)) {
            response.put("success", false);
            response.put("message", "존재하지 않는 계정입니다.");
            return response;
        }

        response.put("success", true);
        response.put("message", "로그인 성공");
        response.put("memberType", user.getMemberType());
        response.put("username", user.getUsername());
        response.put("name", user.getName());
        response.put("grade", user.getGrade());
        response.put("adminRole", user.getAdminRole());
        response.put("universityId", user.getUniversityId());

        // DEPT_ADMIN: include resolved deptId so the client banner can deep-link
        // straight to /admin/dept/{id}.
        if ("DEPT_ADMIN".equals(user.getAdminRole())
                && user.getUniversityId() != null && user.getDepartment() != null) {
            try {
                Long deptId = adminService.resolveDeptIdByName(
                        Long.parseLong(user.getUniversityId()), user.getDepartment());
                if (deptId != null) response.put("deptId", deptId);
            } catch (NumberFormatException ignored) { /* leave deptId off */ }
        }
        return response;
    }

    public Map<String, Object> signup(SignupRequestDto request) {
        Map<String, Object> response = new HashMap<>();

        if (userRepository.existsByUsername(request.getUsername())) {
            response.put("success", false);
            response.put("message", "이미 사용 중인 아이디입니다.");
            return response;
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setMemberType(request.getMemberType());
        user.setUniversityId(request.getUniversityId());
        user.setCollege(request.getCollege());
        user.setDepartment(request.getDepartment());
        user.setStudentId(request.getStudentId());
        user.setPhone(request.getPhone());
        user.setGrade(request.getGrade());
        user.setStatus(request.getMemberType().equals("admin") ? "PENDING_APPROVAL" : "ACTIVE");
        user.setCreatedDate(java.time.LocalDateTime.now());

        userRepository.save(user);

        response.put("success", true);
        response.put("message", "회원가입이 완료되었습니다.");
        return response;
    }

    public Map<String, Object> checkId(String username) {
        Map<String, Object> response = new HashMap<>();
        boolean available = !userRepository.existsByUsername(username);
        response.put("available", available);
        response.put("message", available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.");
        return response;
    }

    public Map<String, Object> findId(FindIdRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByNameAndPhone(
                request.getName(), request.getPhone());

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "일치하는 회원 정보가 없습니다.");
            return response;
        }

        String username = userOpt.get().getUsername();
        String masked = username.substring(0, Math.min(3, username.length()))
                + "***"
                + (username.length() > 3 ? username.substring(username.length() - 3) : "");

        response.put("success", true);
        response.put("username", masked);
        response.put("message", "아이디를 찾았습니다.");
        return response;
    }

    public Map<String, Object> findPassword(FindPasswordRequestDto request) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "일치하는 회원 정보가 없습니다.");
            return response;
        }

        User user = userOpt.get();
        if (!user.getName().equals(request.getName()) ||
            !user.getPhone().equals(request.getPhone())) {
            response.put("success", false);
            response.put("message", "입력하신 정보가 일치하지 않습니다.");
            return response;
        }

        String tempPassword = "temp1234!";
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "임시 비밀번호: " + tempPassword);
        return response;
    }
}
