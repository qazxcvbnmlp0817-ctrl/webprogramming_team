package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

/**
 * 공지사항 페이지 컨트롤러
 * - URL: GET /notice
 * - 렌더링 템플릿: templates/notice/list.html
 * - TODO: [팀원-공지사항 담당] 서비스 로직으로 교체
 */
@Controller
public class NoticeController {

    @GetMapping("/notice")
    public String list(Model model) {
        // 현재 페이지 식별자 (네비게이션 바 활성 메뉴 표시용)
        model.addAttribute("currentPage", "notice");

        // 긴급/대표 공지 (Featured 섹션용 더미 데이터)
        model.addAttribute("featured", new NoticeDto(
            1L, "2026년 1학기 수강신청 변경 안내", "2026-05-11",
            "학사팀", "학사", 1204, true
        ));

        // 공지 목록 더미 데이터 (실제 DB 연동 전 테스트용)
        model.addAttribute("notices", List.of(
            new NoticeDto(2L, "2026년 장학금 신청 안내", "2026-05-10", "장학팀", "장학", 892, false),
            new NoticeDto(3L, "봄 체육대회 일정 공지", "2026-05-09", "학생처", "행사", 441, false),
            new NoticeDto(4L, "현장실습 참가 모집", "2026-05-08", "취업팀", "취업", 330, false),
            new NoticeDto(5L, "교수학습 특강 안내", "2026-05-07", "교학처", "학사", 215, false),
            new NoticeDto(6L, "긴급 장학금 추가 모집", "2026-05-06", "장학팀", "장학", 178, false),
            new NoticeDto(7L, "졸업논문 제출 마감 공지", "2026-05-05", "학사팀", "학사", 654, false),
            new NoticeDto(8L, "SW 해커톤 모집", "2026-05-04", "학생처", "행사", 299, false),
            new NoticeDto(9L, "취업박람회 참가 안내", "2026-05-03", "취업팀", "취업", 410, false),
            new NoticeDto(10L, "성적 이의신청 기간 안내", "2026-05-02", "학사팀", "학사", 521, false)
        ));

        return "notice/list";
    }

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
