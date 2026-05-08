package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 게시판 페이지 컨트롤러
 * - URL: GET /board
 * - 렌더링 템플릿: templates/board/list.html
 * - TODO: [팀원-게시판 담당] 이 컨트롤러에 게시판 서비스 로직을 구현해주세요
 */
@Controller
public class BoardController {

    @GetMapping("/board")
    public String list(Model model) {
        model.addAttribute("currentPage", "board");
        return "board/list";  // templates/board/list.html 렌더링
    }
}
