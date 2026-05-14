package com.example.demo.controller;

import com.example.demo.dto.ScheduleDto;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class ScheduleController {

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
