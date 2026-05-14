package com.example.demo.controller;

import com.example.demo.dto.ScheduleDto;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

/**
 * 일정 페이지 컨트롤러
 * - URL: GET /schedule
 * - 렌더링 템플릿: templates/schedule/list.html
 * - 모델 변수: schedules(List<ScheduleDto>)
 * - TODO: [팀원-일정 담당] scheduleService 주입 후 더미 데이터를 서비스 호출로 교체해주세요.
 */
@Controller
public class ScheduleController {

    @GetMapping("/schedule")
    public String list(Model model) {

        // 더미 일정 목록 (5월~6월, 카테고리 혼합, dday 오름차순 정렬)
        // TODO: [팀원-일정] scheduleService.getAll() 로 교체
        model.addAttribute("schedules", List.of(
            new ScheduleDto(1L,  "중간고사 시작",              "2026-05-12",  1, "시험"),
            new ScheduleDto(2L,  "프로그래밍 과제 제출 마감",  "2026-05-14",  3, "학사"),
            new ScheduleDto(3L,  "프로젝트 중간 발표",         "2026-05-20",  9, "학사"),
            new ScheduleDto(4L,  "중간고사 성적 발표",         "2026-05-23", 12, "학사"),
            new ScheduleDto(5L,  "학과 체육대회",              "2026-05-27", 16, "행사"),
            new ScheduleDto(6L,  "졸업작품 심사 신청 마감",    "2026-05-30", 19, "학사"),
            new ScheduleDto(7L,  "학과 축제",                  "2026-06-01", 21, "행사"),
            new ScheduleDto(8L,  "기말고사 범위 공고",         "2026-06-05", 25, "시험"),
            new ScheduleDto(9L,  "여름 계절학기 수강신청",     "2026-06-10", 30, "학사"),
            new ScheduleDto(10L, "기말고사 시작",              "2026-06-16", 36, "시험"),
            new ScheduleDto(11L, "졸업논문 최종 제출",         "2026-06-20", 40, "학사"),
            new ScheduleDto(12L, "여름 방학 시작",             "2026-06-27", 47, "기타")
        ));

        model.addAttribute("currentPage", "schedule");
        return "schedule/list";  // templates/schedule/list.html 렌더링
    }

    @GetMapping("/api/schedules")
    @ResponseBody
    public List<ScheduleDto> apiSchedules() {
        return List.of(
            new ScheduleDto(1L, "중간고사 시작",      "2026-05-12",  1, "시험"),
            new ScheduleDto(2L, "프로젝트 발표",      "2026-05-20",  9, "학사"),
            new ScheduleDto(3L, "수강신청 변경기간",   "2026-05-25", 14, "학사"),
            new ScheduleDto(4L, "학과 축제",          "2026-06-01", 21, "행사"),
            new ScheduleDto(5L, "기말고사 시작",      "2026-06-16", 36, "시험"),
            new ScheduleDto(6L, "기말고사 종료",      "2026-06-20", 40, "시험"),
            new ScheduleDto(7L, "여름 방학 시작",     "2026-06-27", 47, "학사"),
            new ScheduleDto(8L, "졸업논문 제출 마감", "2026-07-15", 65, "학사")
        );
    }
}
