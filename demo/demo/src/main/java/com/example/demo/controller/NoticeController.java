package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

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
}
