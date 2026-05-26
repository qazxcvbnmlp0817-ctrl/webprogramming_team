package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.FindIdRequestDto;
import com.example.demo.dto.FindPasswordRequestDto;
import com.example.demo.dto.LoginRequestDto;
import com.example.demo.dto.SignupRequestDto;
import com.example.demo.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody SignupRequestDto request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @GetMapping("/check-id")
    public ResponseEntity<Map<String, Object>> checkId(@RequestParam String username) {
        return ResponseEntity.ok(authService.checkId(username));
    }

    @PostMapping("/find-id")
    public ResponseEntity<Map<String, Object>> findId(@RequestBody FindIdRequestDto request) {
        return ResponseEntity.ok(authService.findId(request));
    }

    @PostMapping("/find-password")
    public ResponseEntity<Map<String, Object>> findPassword(@RequestBody FindPasswordRequestDto request) {
        return ResponseEntity.ok(authService.findPassword(request));
    }

    @PostMapping("/change-name")
    public ResponseEntity<Map<String, Object>> changeName(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(authService.changeName(request.get("username"), request.get("newName")));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(authService.changePassword(request.get("username"), request.get("newPassword")));
    }

    @GetMapping("/notification-settings")
    public ResponseEntity<Map<String, Object>> getNotificationSettings(@RequestParam String username) {
        return ResponseEntity.ok(authService.getNotificationSettings(username));
    }

    @PostMapping("/notification-settings")
    public ResponseEntity<Map<String, Object>> saveNotificationSettings(@RequestBody Map<String, Object> request) {
        String username    = (String)  request.get("username");
        Boolean notiNotice  = (Boolean) request.get("notiNotice");
        Boolean notiComment = (Boolean) request.get("notiComment");
        Boolean notiDday    = (Boolean) request.get("notiDday");
        return ResponseEntity.ok(authService.saveNotificationSettings(username, notiNotice, notiComment, notiDday));
    }
}
