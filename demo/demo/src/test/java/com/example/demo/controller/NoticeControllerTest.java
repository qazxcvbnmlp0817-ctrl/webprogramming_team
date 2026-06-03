package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.dto.NoticeDto;
import com.example.demo.repository.PageVisitRepository;
import com.example.demo.service.AdminService;
import com.example.demo.service.NoticeCommentService;
import com.example.demo.service.NoticeService;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NoticeController.class)
class NoticeControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean NoticeService noticeService;
    @MockitoBean NoticeCommentService noticeCommentService;
    @MockitoBean AdminService adminService;
    @MockitoBean PageVisitRepository pageVisitRepository;

    @BeforeEach
    void setUp() {
        when(noticeService.getNoticesByDept(1L))
                .thenReturn(List.of(new NoticeDto(1L, "Notice", "2026-06-02", "admin", "school", 0, true)));
    }

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
