package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.dto.PostDto;
import com.example.demo.repository.PageVisitRepository;
import com.example.demo.service.AdminService;
import com.example.demo.service.CommentService;
import com.example.demo.service.PostService;

import java.util.List;
import java.util.stream.IntStream;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BoardController.class)
class BoardControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean PostService postService;
    @MockitoBean CommentService commentService;
    @MockitoBean AdminService adminService;
    @MockitoBean PageVisitRepository pageVisitRepository;

    @BeforeEach
    void setUp() {
        List<PostDto> posts = IntStream.rangeClosed(1, 9)
                .mapToObj(i -> new PostDto((long) i, "Post " + i, "author", 0,
                        "free", 0, "2026-06-02", i == 1, 0, false,
                        null, List.of(1), "PUBLIC"))
                .toList();
        when(postService.getPostsByDept(1L)).thenReturn(posts);
    }

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
