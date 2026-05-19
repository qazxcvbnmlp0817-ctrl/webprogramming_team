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
}
