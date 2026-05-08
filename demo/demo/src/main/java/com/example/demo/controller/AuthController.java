package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 인증(로그인) 페이지 컨트롤러
 * - URL: GET /login
 * - 렌더링 템플릿: templates/auth/login.html
 * - TODO: [팀원-인증 담당] 이 컨트롤러에 로그인·로그아웃 서비스 로직을 구현해주세요
 */
@Controller
public class AuthController {

    @GetMapping("/login")
    public String login(Model model) {
        model.addAttribute("currentPage", "login");
        return "auth/login";  // templates/auth/login.html 렌더링
    }
}
