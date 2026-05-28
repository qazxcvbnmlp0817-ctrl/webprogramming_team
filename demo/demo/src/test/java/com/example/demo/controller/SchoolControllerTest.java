package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// 학교 선택은 React SPA에서 처리. SPA 폴백 경로 테스트.
@WebMvcTest({SchoolController.class, SpaController.class})
class SchoolControllerTest {

    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("GET /universities/{id}/schools → SPA index.html 포워딩")
    void schoolsRoute_forwardsToSpa() throws Exception {
        mockMvc.perform(get("/universities/1/schools"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }
}
