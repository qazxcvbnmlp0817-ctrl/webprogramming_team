package com.example.demo.controller;

import com.example.demo.dto.PostDto;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;

@Controller
public class BoardController {

    @GetMapping("/api/posts")
    @ResponseBody
    public Map<String, Object> apiPosts() {
        PostDto featured = new PostDto(1L, "중간고사 자료구조 족보 공유합니다", "박민수", 45, "자유게시판", 312, "2026-05-01", true, 18);
        List<PostDto> posts = List.of(
            new PostDto(1L, "중간고사 자료구조 족보 공유합니다",    "박민수", 45, "자유게시판", 312, "2026-05-01", true,  18),
            new PostDto(2L, "카카오 인턴십 합격 후기 (2026 상반기)", "이철수", 32, "취업후기",  280, "2026-04-28", false, 25),
            new PostDto(3L, "알고리즘 스터디 같이 할 분 모집",      "홍길동", 24, "스터디",    150, "2026-04-25", false,  7),
            new PostDto(4L, "졸업작품 팀원 구합니다 (4인 팀)",      "김영희", 18, "자유게시판",  98, "2026-04-20", false, 33),
            new PostDto(5L, "교수님 연구실 학부 인턴 모집 공고",    "정교수", 12, "취업후기",   74, "2026-04-18", false,  3),
            new PostDto(6L, "운영체제 과제 질문있어요",             "학생A",   8, "질문",       45, "2026-04-15", false,  6),
            new PostDto(7L, "데이터베이스 스터디원 모집",           "학생B",   6, "스터디",     32, "2026-04-12", false,  4),
            new PostDto(8L, "취업 준비 팁 공유",                   "학생C",   5, "취업후기",   28, "2026-04-10", false,  9),
            new PostDto(9L, "1학년 수강신청 추천 조합",            "학생D",   3, "자유게시판",  18, "2026-04-08", false,  2)
        );
        return Map.of("featured", featured, "posts", posts);
    }
}
