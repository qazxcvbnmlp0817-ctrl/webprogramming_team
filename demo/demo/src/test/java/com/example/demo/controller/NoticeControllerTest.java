package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 공지사항 페이지 컨트롤러 테스트 — 연결: NoticeController → notice/list.html */
@WebMvcTest(NoticeController.class)
class NoticeControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("공지사항 GET /notice → 200 OK, notice/list 뷰")
    void 공지사항페이지_정상_로드() throws Exception {
        mockMvc.perform(get("/notice"))
                .andExpect(status().isOk())
                .andExpect(view().name("notice/list"))
                .andExpect(model().attribute("currentPage", "notice"));
    }

    @Test
    @DisplayName("공지사항 모델에 notices 리스트 포함")
    void notices_모델_속성_포함() throws Exception {
        mockMvc.perform(get("/notice"))
                .andExpect(status().isOk())
                .andExpect(model().attributeExists("notices"))
                .andExpect(model().attributeExists("featured"));
    }
}
