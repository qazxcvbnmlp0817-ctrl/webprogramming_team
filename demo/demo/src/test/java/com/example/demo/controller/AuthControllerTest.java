package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// 로그인 페이지는 React SPA에서 처리. SPA 폴백 경로 테스트.
@WebMvcTest({AuthController.class, SpaController.class})
class AuthControllerTest {

    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("GET /login → SPA index.html 포워딩")
    void loginRoute_forwardsToSpa() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }
}
