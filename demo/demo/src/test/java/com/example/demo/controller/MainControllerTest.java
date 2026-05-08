package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 메인 페이지 컨트롤러 테스트
 * 연결 컨트롤러: MainController → templates/main/index.html
 */
@WebMvcTest(MainController.class)
class MainControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    @DisplayName("메인 페이지 GET / → 200 OK, main/index 뷰 반환")
    void 메인페이지_정상_로드() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("main/index"))
                // 더미 데이터 3종이 모델에 담겨 있는지 확인
                .andExpect(model().attributeExists("notices"))
                .andExpect(model().attributeExists("posts"))
                .andExpect(model().attributeExists("schedules"))
                .andExpect(model().attributeExists("today"))
                .andExpect(model().attribute("currentPage", "main"));
    }
}
