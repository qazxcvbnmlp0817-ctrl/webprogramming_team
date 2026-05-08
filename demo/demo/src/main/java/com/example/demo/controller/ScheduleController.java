package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 일정 페이지 컨트롤러
 * - URL: GET /schedule
 * - 렌더링 템플릿: templates/schedule/list.html
 * - TODO: [팀원-일정 담당] 이 컨트롤러에 일정 서비스 로직을 구현해주세요
 */
@Controller
public class ScheduleController {

    @GetMapping("/schedule")
    public String list(Model model) {
        model.addAttribute("currentPage", "schedule");
        return "schedule/list";  // templates/schedule/list.html 렌더링
    }
}
