package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 공지사항 페이지 컨트롤러
 * - URL: GET /notice
 * - 렌더링 템플릿: templates/notice/list.html
 * - TODO: [팀원-공지사항 담당] 이 컨트롤러에 공지사항 서비스 로직을 구현해주세요
 */
@Controller
public class NoticeController {

    @GetMapping("/notice")
    public String list(Model model) {
        // 현재 페이지 식별자 (네비게이션 바 활성 메뉴 표시용)
        model.addAttribute("currentPage", "notice");
        return "notice/list";  // templates/notice/list.html 렌더링
    }
}
