package com.example.demo.controller;

import com.example.demo.dto.UniversityDto;
import com.example.demo.util.DummyDataHelper;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * 대학교 선택·메인 컨트롤러
 * - GET /universities        : 대학교 카드 목록 (Entry Point)
 * - GET /universities/{id}   : 대학교 메인 페이지
 * TODO: [팀원] DummyDataHelper → universityService.findAll() / findById() 로 교체
 */
@Controller
public class UniversityController {

    @GetMapping("/universities")
    public String showUniversities(Model model) {
        model.addAttribute("universities", DummyDataHelper.getUniversities());
        return "university/index";
    }

    @GetMapping("/universities/{id}")
    public String showUniversity(@PathVariable Long id, Model model, HttpSession session) {
        UniversityDto university = DummyDataHelper.findUniversity(id);
        if (university == null) {
            return "redirect:/universities";
        }
        session.setAttribute("selectedUniversityId",   university.getId());
        session.setAttribute("selectedUniversityName", university.getName());

        model.addAttribute("university", university);
        model.addAttribute("today", LocalDate.now()
                .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 EEEE", Locale.KOREAN)));
        return "university/show";
    }
}
