package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * React SPA 폴백 컨트롤러
 * /api/** 및 정적 파일을 제외한 모든 경로를 index.html로 포워딩합니다.
 */
@Controller
public class SpaController {

    @GetMapping(value = {
        "/",
        // 대학 목록/상세
        "/universities",
        "/universities/{id:[0-9]+}",
        "/universities/{id:[0-9]+}/schools",
        // 학교(school) 범위
        "/school/departments",
        "/school/notice",
        "/school/notice/write",
        "/school/board",
        "/school/board/write",
        "/school/schedule",
        "/school/info",
        // 학부(faculty) 범위
        "/school/faculty/{facultyId:[0-9]+}",
        "/school/faculty/{facultyId:[0-9]+}/notice",
        "/school/faculty/{facultyId:[0-9]+}/notice/write",
        "/school/faculty/{facultyId:[0-9]+}/board",
        "/school/faculty/{facultyId:[0-9]+}/schedule",
        // 학과(dept) 범위
        "/dept/home",
        "/dept/notice",
        "/dept/notice/write",
        "/dept/board",
        "/dept/board/write",
        "/dept/schedule",
        "/dept/department",
        // 레거시 리다이렉트 경로
        "/notice",
        "/board",
        "/schedule",
        "/department",
        // 인증
        "/login",
        "/signup",
        "/mypage",
        "/find-id",
        "/find-password"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
