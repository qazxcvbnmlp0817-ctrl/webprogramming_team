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
        "/universities",
        "/universities/{id:[0-9]+}",
        "/universities/{id:[0-9]+}/schools",
        "/school/departments",
        "/school/notice",
        "/school/board",
        "/school/schedule",
        "/school/info",
        "/dept/notice",
        "/dept/board",
        "/dept/board/write",
        "/dept/schedule",
        "/dept/department",
        "/notice",
        "/board",
        "/schedule",
        "/department",
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
