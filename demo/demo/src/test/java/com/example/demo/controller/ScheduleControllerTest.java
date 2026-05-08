package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 일정 페이지 컨트롤러 테스트 — 연결: ScheduleController → schedule/list.html */
@WebMvcTest(ScheduleController.class)
class ScheduleControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("일정 GET /schedule → 200 OK, schedule/list 뷰")
    void 일정페이지_정상_로드() throws Exception {
        mockMvc.perform(get("/schedule"))
                .andExpect(status().isOk())
                .andExpect(view().name("schedule/list"))
                .andExpect(model().attribute("currentPage", "schedule"));
    }
}
