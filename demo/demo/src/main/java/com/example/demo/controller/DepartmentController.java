package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 학과정보 페이지 컨트롤러
 * - URL: GET /department
 * - 렌더링 템플릿: templates/department/index.html
 * - TODO: [팀원-학과정보 담당] 이 컨트롤러에 학과정보 서비스 로직을 구현해주세요
 */
@Controller
public class DepartmentController {

    @GetMapping("/department")
    public String index(Model model) {
        model.addAttribute("currentPage", "department");
        return "department/index";  // templates/department/index.html 렌더링
    }
}
