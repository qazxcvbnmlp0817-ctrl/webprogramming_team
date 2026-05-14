package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
public class NoticeController {

    @GetMapping("/api/notices")
    @ResponseBody
    public Map<String, Object> apiNotices() {
        NoticeDto featured = new NoticeDto(1L, "[긴급] 2026년 1학기 수강정정 기간 안내", "2026-05-11", "학과사무실", "학사", 215, true);
        List<NoticeDto> notices = List.of(
            new NoticeDto(1L, "[긴급] 2026년 1학기 수강정정 기간 안내", "2026-05-11", "학과사무실", "학사", 215, true),
            new NoticeDto(2L, "2026년 1학기 수강신청 일정 안내",         "2026-05-08", "학과사무실", "학사", 102, false),
            new NoticeDto(3L, "졸업논문 제출 마감 안내",                 "2026-05-06", "학과사무실", "학사",  87, false),
            new NoticeDto(4L, "장학금 신청 안내 (5월 15일까지)",         "2026-05-04", "학생처",     "장학",  65, false),
            new NoticeDto(5L, "실험실 안전교육 일정 공지",               "2026-05-02", "학과사무실", "학사",  43, false),
            new NoticeDto(6L, "2026 산학협력 세미나 개최 안내",          "2026-04-30", "학과사무실", "행사",  31, false),
            new NoticeDto(7L, "졸업작품 심사 일정 공지",                 "2026-04-28", "학과사무실", "학사",  28, false),
            new NoticeDto(8L, "교내 해커톤 참가 모집",                   "2026-04-25", "학생처",     "행사",  19, false)
        );
        return Map.of("featured", featured, "notices", notices);
    }
}
