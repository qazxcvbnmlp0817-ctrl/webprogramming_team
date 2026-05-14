package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.PostDto;
import com.example.demo.dto.ScheduleDto;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Controller
public class MainController {

    @GetMapping("/api/main")
    @ResponseBody
    public Map<String, Object> apiMain(@RequestParam(required = false, defaultValue = "") String deptName) {
        Map<String, Object> result = new HashMap<>();
        result.put("notices", List.of(
            new NoticeDto(1L, "2026년 1학기 수강신청 일정 안내", "2026-05-08", "학과사무실", "학사",  102, false),
            new NoticeDto(2L, "졸업논문 제출 마감 안내",         "2026-05-06", "학과사무실", "학사",   87, false),
            new NoticeDto(3L, "장학금 신청 안내 (5월 15일까지)", "2026-05-04", "학생처",     "장학",   65, false),
            new NoticeDto(4L, "실험실 안전교육 일정 공지",       "2026-05-02", "학과사무실", "학사",   43, false),
            new NoticeDto(5L, "2026 산학협력 세미나 개최 안내",  "2026-04-30", "학과사무실", "행사",   31, false)
        ));
        result.put("posts", List.of(
            new PostDto(1L, "중간고사 자료구조 족보 공유합니다",    "박민수", 45, "자유게시판", 312, "2026-05-01", false, 18),
            new PostDto(2L, "카카오 인턴십 합격 후기 (2026 상반기)", "이철수", 32, "취업후기",  280, "2026-04-28", false, 25),
            new PostDto(3L, "알고리즘 스터디 같이 할 분 모집",      "홍길동", 24, "스터디",    150, "2026-04-25", false,  7),
            new PostDto(4L, "졸업작품 팀원 구합니다 (4인 팀)",      "김영희", 18, "자유게시판",  98, "2026-04-20", false, 33),
            new PostDto(5L, "교수님 연구실 학부 인턴 모집 공고",    "정교수", 12, "취업후기",   74, "2026-04-18", false,  3)
        ));
        result.put("schedules", List.of(
            new ScheduleDto(1L, "중간고사 시작",   "2026-05-12",  1, "시험"),
            new ScheduleDto(2L, "프로젝트 발표",   "2026-05-20",  9, "학사"),
            new ScheduleDto(3L, "학과 축제",       "2026-06-01", 21, "행사"),
            new ScheduleDto(4L, "기말고사 시작",   "2026-06-16", 36, "시험"),
            new ScheduleDto(5L, "여름 방학 시작",  "2026-06-27", 47, "학사")
        ));
        result.put("today", LocalDate.now()
            .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 EEEE", Locale.KOREAN)));
        result.put("selectedDeptName", deptName);
        return result;
    }
}
