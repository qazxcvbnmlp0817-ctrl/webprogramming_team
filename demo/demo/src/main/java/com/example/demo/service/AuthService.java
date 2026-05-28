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
        response.put("department", user.getDepartment());
        response.put("college", user.getCollege());
        response.put("enrollmentStatus", user.getEnrollmentStatus());

        // 모든 유저: deptId, facultyId 조회 (접근 권한 체크용)
        if (user.getUniversityId() != null && user.getDepartment() != null) {
            try {
                Long deptId = adminService.resolveDeptIdByName(
                        Long.parseLong(user.getUniversityId()), user.getDepartment());
                if (deptId != null) response.put("deptId", deptId);
            } catch (NumberFormatException ignored) {}
        }
        if (user.getUniversityId() != null && user.getCollege() != null) {
            try {
                Long facultyId = adminService.resolveFacultyIdByName(
                        Long.parseLong(user.getUniversityId()), user.getCollege());
                if (facultyId != null) response.put("facultyId", facultyId);
            } catch (NumberFormatException ignored) {}
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
        user.setEnrollmentStatus(request.getEnrollmentStatus());
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

        Optional<User> userOpt;
        if (request.getUniversityId() == null && request.getStudentId() == null) {
            // 관리자: 이름만으로 조회
            userOpt = userRepository.findByName(request.getName());
        } else if (request.getUniversityId() != null && request.getCollege() != null && request.getStudentId() != null) {
            // 학생/교수/조교/직원: 이름 + 학번/교번 + 단과대 + 대학
            userOpt = userRepository.findByNameAndStudentIdAndCollegeAndUniversityId(
                    request.getName(), request.getStudentId(),
                    request.getCollege(), request.getUniversityId());
        } else {
            userOpt = Optional.empty();
        }

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

    public Map<String, Object> changeName(String username, String newName) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return response;
        }
        User user = userOpt.get();
        user.setName(newName);
        userRepository.save(user);
        response.put("success", true);
        response.put("message", "이름이 변경되었습니다.");
        return response;
    }

    public Map<String, Object> changePassword(String username, String newPassword) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return response;
        }
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        response.put("success", true);
        response.put("message", "비밀번호가 변경되었습니다.");
        return response;
    }

    public Map<String, Object> getNotificationSettings(String username) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return response;
        }
        User user = userOpt.get();
        response.put("success", true);
        response.put("notiNotice",  user.getNotiNotice()  != null ? user.getNotiNotice()  : true);
        response.put("notiComment", user.getNotiComment() != null ? user.getNotiComment() : true);
        response.put("notiDday",    user.getNotiDday()    != null ? user.getNotiDday()    : true);
        return response;
    }

    public Map<String, Object> saveNotificationSettings(String username,
                                                         Boolean notiNotice,
                                                         Boolean notiComment,
                                                         Boolean notiDday) {
        Map<String, Object> response = new HashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "사용자를 찾을 수 없습니다.");
            return response;
        }
        User user = userOpt.get();
        user.setNotiNotice(notiNotice);
        user.setNotiComment(notiComment);
        user.setNotiDday(notiDday);
        userRepository.save(user);
        response.put("success", true);
        response.put("message", "알림 설정이 저장되었습니다.");
        return response;
    }

    public Map<String, Object> findPassword(FindPasswordRequestDto request) {
        Map<String, Object> response = new HashMap<>();

        Optional<User> userOpt;
        if (request.getUniversityId() == null && request.getStudentId() == null) {
            // 관리자: 아이디 + 이름만으로 조회
            userOpt = userRepository.findByUsernameAndName(request.getUsername(), request.getName());
        } else if (request.getUniversityId() != null && request.getCollege() != null && request.getStudentId() != null) {
            // 학생/교수/조교/직원: 아이디 + 이름 + 학번/교번 + 단과대 + 대학
            userOpt = userRepository.findByUsernameAndNameAndStudentIdAndCollegeAndUniversityId(
                    request.getUsername(), request.getName(),
                    request.getStudentId(), request.getCollege(), request.getUniversityId());
        } else {
            userOpt = Optional.empty();
        }

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "일치하는 회원 정보가 없습니다.");
            return response;
        }

        response.put("success", true);
        response.put("message", "본인 확인이 완료되었습니다.");
        return response;
    }
}
