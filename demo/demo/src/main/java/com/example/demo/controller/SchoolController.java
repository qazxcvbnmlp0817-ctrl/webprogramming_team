// demo/demo/src/main/java/com/example/demo/controller/SchoolController.java
package com.example.demo.controller;

import com.example.demo.dto.DeptSelectionDto;
import com.example.demo.dto.FacultyDto;
import com.example.demo.dto.SchoolDto;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

/**
 * 학교·학부·학과 선택 컨트롤러
 * - GET  /schools          : 전체 계층 선택 페이지
 * - POST /schools/select   : 학과 세션 저장 → redirect /
 * - GET  /faculty/{id}     : 학부 페이지 플레이스홀더
 * TODO: [팀원] getDummySchools()를 schoolService.findAll()로 교체
 */
@Controller
public class SchoolController {

    private List<SchoolDto> getDummySchools() {
        return List.of(
            new SchoolDto(1L, "공과대학", "공학 분야 전문 인재 양성", List.of(
                new FacultyDto(1L, "정보통신공학부", 1L, List.of(
                    new DeptSelectionDto(1L, "컴퓨터공학과", 1L),
                    new DeptSelectionDto(2L, "전기전자공학과", 1L),
                    new DeptSelectionDto(3L, "정보통신공학과", 1L)
                )),
                new FacultyDto(2L, "기계시스템공학부", 1L, List.of(
                    new DeptSelectionDto(4L, "기계공학과", 2L),
                    new DeptSelectionDto(5L, "토목환경공학과", 2L)
                ))
            )),
            new SchoolDto(2L, "인문대학", "인문학적 소양과 창의적 사고 함양", List.of(
                new FacultyDto(3L, "인문학부", 2L, List.of(
                    new DeptSelectionDto(6L, "국어국문학과", 3L),
                    new DeptSelectionDto(7L, "영어영문학과", 3L),
                    new DeptSelectionDto(8L, "사학과", 3L)
                ))
            )),
            new SchoolDto(3L, "사회과학대학", "사회 현상 분석과 문제 해결 능력 배양", List.of(
                new FacultyDto(4L, "사회과학부", 3L, List.of(
                    new DeptSelectionDto(9L,  "행정학과", 4L),
                    new DeptSelectionDto(10L, "경제학과", 4L),
                    new DeptSelectionDto(11L, "사회학과", 4L)
                ))
            )),
            new SchoolDto(4L, "자연과학대학", "기초과학 연구와 응용과학 발전 선도", List.of(
                new FacultyDto(5L, "자연과학부", 4L, List.of(
                    new DeptSelectionDto(12L, "수학과", 5L),
                    new DeptSelectionDto(13L, "물리학과", 5L),
                    new DeptSelectionDto(14L, "화학과", 5L)
                ))
            )),
            new SchoolDto(5L, "사범대학", "미래 교육을 이끌 전문 교사 양성", List.of(
                new FacultyDto(6L, "사범학부", 5L, List.of(
                    new DeptSelectionDto(15L, "교육학과", 6L),
                    new DeptSelectionDto(16L, "수학교육과", 6L)
                ))
            )),
            new SchoolDto(6L, "해양수산대학", "해양 자원 개발과 수산 분야 전문 인재 육성", List.of(
                new FacultyDto(7L, "해양수산부", 6L, List.of(
                    new DeptSelectionDto(17L, "해양시스템공학과", 7L),
                    new DeptSelectionDto(18L, "수산생명과학과", 7L)
                ))
            ))
        );
    }

    @GetMapping("/schools")
    public String showSchools(Model model) {
        model.addAttribute("schools", getDummySchools());
        return "school/index";
    }

    @PostMapping("/schools/select")
    public String selectDept(
            @RequestParam Long deptId,
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
