package com.example.demo.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dto.FindIdRequestDto;
import com.example.demo.dto.FindPasswordRequestDto;
import com.example.demo.dto.LoginRequestDto;
import com.example.demo.dto.SignupRequestDto;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

// ===== DB 연동 시 추가할 것 =====
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class AuthService {

    private final UserRepository userRepository;

    // ===== DB 연동 시 추가 =====
    // private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

        // ===== DB 연동 시 아래로 교체 =====
        // if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        if (!user.getPassword().equals(request.getPassword())) {
            response.put("success", false);
            response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return response;
        }

        if (!user.getMemberType().equals(request.getMemberType())) {
            response.put("success", false);
            response.put("message", "회원 유형이 일치하지 않습니다.");
            return response;
        }

        if (user.getMemberType().equals("admin") && !user.isApproved()) {
            response.put("success", false);
            response.put("message", "관리자 승인 후 이용 가능합니다.");
            return response;
        }

        response.put("success", true);
        response.put("message", "로그인 성공");
        response.put("memberType", user.getMemberType());
        response.put("username", user.getUsername());
        response.put("name", user.getName());
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

        // ===== DB 연동 시 아래로 교체 =====
        // user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPassword(request.getPassword());

        user.setName(request.getName());
        user.setMemberType(request.getMemberType());
        user.setUniversityId(request.getUniversityId());
        user.setCollege(request.getCollege());
        user.setDepartment(request.getDepartment());
        user.setStudentId(request.getStudentId());
        user.setApproved(!request.getMemberType().equals("admin"));

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

        // ===== DB 연동 시 임시 비밀번호 암호화 후 저장 =====
        // String tempPassword = "temp1234!";
        // user.setPassword(passwordEncoder.encode(tempPassword));
        String tempPassword = "temp1234!";
        user.setPassword(tempPassword);

        response.put("success", true);
        response.put("message", "임시 비밀번호: " + tempPassword);
        return response;
    }
}
