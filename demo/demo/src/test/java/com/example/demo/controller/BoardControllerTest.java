package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BoardController.class)
class BoardControllerTest {

    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/posts → 200 OK, JSON에 featured·posts 포함")
    void apiPosts_returns200_withData() throws Exception {
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.featured").isMap())
                .andExpect(jsonPath("$.posts").isArray());
    }

    @Test
    @DisplayName("GET /api/posts → posts 목록 9개 반환")
    void apiPosts_returnsNinePosts() throws Exception {
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.posts.length()").value(9));
    }
}
