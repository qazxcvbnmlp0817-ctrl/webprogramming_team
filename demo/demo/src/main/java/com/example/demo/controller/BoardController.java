package com.example.demo.controller;

import com.example.demo.dto.PostDto;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

/**
 * 게시판 페이지 컨트롤러
 * - URL: GET /board
 * - 렌더링 템플릿: templates/board/list.html
 * - 모델 변수: featured(PostDto), posts(List<PostDto>)
 * - TODO: [팀원-게시판 담당] postService 주입 후 더미 데이터를 서비스 호출로 교체해주세요.
 */
@Controller
public class BoardController {

    @GetMapping("/board")
    public String list(Model model) {

        // 더미 대표 게시글 (featured=true)
        // TODO: [팀원-게시판] postService.getFeatured() 로 교체
        model.addAttribute("featured",
            new PostDto(10L, "2026 상반기 취업 대비 완전 정복 가이드 — 서류·코딩·면접",
                        "취업준비생", 98, "취업후기", 1024, "2026-05-10", true));

        // 더미 게시글 목록 (9개, 카테고리 혼합)
        // TODO: [팀원-게시판] postService.getList() 로 교체
        model.addAttribute("posts", List.of(
            new PostDto(1L,  "중간고사 자료구조 족보 공유합니다",          "박민수", 45, "자유게시판", 312, "2026-05-01", false),
            new PostDto(2L,  "카카오 인턴십 합격 후기 (2026 상반기)",      "이철수", 32, "취업후기",  280, "2026-04-28", false),
            new PostDto(3L,  "알고리즘 스터디 같이 할 분 모집 (주 2회)",   "홍길동", 24, "스터디",    150, "2026-04-25", false),
            new PostDto(4L,  "졸업작품 팀원 구합니다 (4인 팀, 웹 프로젝트)","김영희", 18, "자유게시판",  98, "2026-04-20", false),
            new PostDto(5L,  "교수님 연구실 학부 인턴 모집 공고",          "정교수", 12, "취업후기",   74, "2026-04-18", false),
            new PostDto(6L,  "운영체제 과제 3번 질문 있어요",              "신입생", 8,  "질문",       56, "2026-05-03", false),
            new PostDto(7L,  "데이터베이스 스터디 모집 (Oracle 기반)",     "DB팀장", 21, "스터디",    132, "2026-04-30", false),
            new PostDto(8L,  "기말고사 범위 공유 (알고리즘 분석 과목)",    "꼼꼼이", 15, "자유게시판",  87, "2026-05-05", false),
            new PostDto(9L,  "교내 해커톤 참가 후기 — 수상 팁 공유",      "해커톤왕", 37, "취업후기",  203, "2026-04-22", false)
        ));

        model.addAttribute("currentPage", "board");
        return "board/list";  // templates/board/list.html 렌더링
    }
}
