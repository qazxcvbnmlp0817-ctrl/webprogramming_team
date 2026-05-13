package com.example.demo.controller;

import com.example.demo.dto.UniversityDto;
import com.example.demo.util.DummyDataHelper;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * 학부·학과 통합 선택 컨트롤러
 * - GET  /schools          : 학부·학과 통합 선택 페이지 (단과대학→학부→학과 한 화면, 대학교 세션 필수)
 * - POST /schools/select   : 학과 세션 저장 → redirect /
 * - GET  /faculty/{id}     : 학부 페이지 플레이스홀더
 * TODO: [팀원] DummyDataHelper → schoolService / facultyService 로 교체
 */
@Controller
public class SchoolController {

    @GetMapping("/schools")
    public String showSchools(Model model, HttpSession session) {
        Long universityId = (Long) session.getAttribute("selectedUniversityId");
        if (universityId == null) {
            return "redirect:/universities";
        }
        UniversityDto university = DummyDataHelper.findUniversity(universityId);
        if (university == null) {
            return "redirect:/universities";
        }
        model.addAttribute("schools",        university.getSchools());
        model.addAttribute("universityId",   universityId);
        model.addAttribute("universityName", session.getAttribute("selectedUniversityName"));
        return "school/index";
    }

    @PostMapping("/schools/select")
    public String selectDept(
            @RequestParam Long   deptId,
            @RequestParam String deptName,
            @RequestParam String schoolName,
            HttpSession session) {
        session.setAttribute("selectedDeptId",    deptId);
        session.setAttribute("selectedDeptName",  deptName);
        session.setAttribute("selectedSchoolName", schoolName);
        return "redirect:/";
    }

    @GetMapping("/faculty/{id}")
    public String facultyPlaceholder(@PathVariable Long id, Model model) {
        model.addAttribute("facultyId", id);
        return "school/faculty-placeholder";
    }
}
