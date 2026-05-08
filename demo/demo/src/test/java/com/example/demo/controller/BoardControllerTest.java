package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 게시판 페이지 컨트롤러 테스트 — 연결: BoardController → board/list.html */
@WebMvcTest(BoardController.class)
class BoardControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("게시판 GET /board → 200 OK, board/list 뷰")
    void 게시판페이지_정상_로드() throws Exception {
        mockMvc.perform(get("/board"))
                .andExpect(status().isOk())
                .andExpect(view().name("board/list"))
                .andExpect(model().attribute("currentPage", "board"));
    }
}
