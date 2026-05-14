package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NoticeController.class)
class NoticeControllerTest {

    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/notices → 200 OK, JSON에 featured·notices 포함")
    void apiNotices_returns200_withData() throws Exception {
        mockMvc.perform(get("/api/notices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.featured").isMap())
                .andExpect(jsonPath("$.notices").isArray());
    }

    @Test
    @DisplayName("GET /api/notices → featured.featured 값은 true")
    void apiNotices_featured_isTrue() throws Exception {
        mockMvc.perform(get("/api/notices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.featured.featured").value(true));
    }
}
