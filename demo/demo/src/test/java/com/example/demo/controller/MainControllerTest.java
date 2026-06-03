package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.PostDto;
import com.example.demo.dto.ScheduleDto;
import com.example.demo.repository.PageVisitRepository;
import com.example.demo.service.NoticeService;
import com.example.demo.service.PostService;
import com.example.demo.service.ScheduleService;
import com.example.demo.service.UniversityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MainController.class)
class MainControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean NoticeService noticeService;
    @MockitoBean PostService postService;
    @MockitoBean ScheduleService scheduleService;
    @MockitoBean UniversityService universityService;
    @MockitoBean PageVisitRepository pageVisitRepository;

    @BeforeEach
    void setUp() {
        when(noticeService.getNoticesByDept(1L))
                .thenReturn(List.of(new NoticeDto(1L, "Notice", "2026-06-02", "admin", "school", 0, true)));
        when(postService.getTopPostsByLikesForDept(1L, 5))
                .thenReturn(List.of(new PostDto(1L, "Post", "author", 0, "free", 0,
                        "2026-06-02", true, 0, false, null, List.of(1), "PUBLIC")));
        when(scheduleService.getSchedulesByDept(1L))
                .thenReturn(List.of(new ScheduleDto(1L, "Schedule", "2026-06-02", 0, "school")));
        when(universityService.findDeptName(1L)).thenReturn("Computer Engineering");
    }

    @Test
    @DisplayName("GET /api/main returns notices, posts, schedules, and today")
    void apiMain_returns200_withData() throws Exception {
        mockMvc.perform(get("/api/main"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notices").isArray())
                .andExpect(jsonPath("$.posts").isArray())
                .andExpect(jsonPath("$.schedules").isArray())
                .andExpect(jsonPath("$.today").isString());
    }

    @Test
    @DisplayName("GET /api/main returns selectedDeptName")
    void apiMain_returnsDeptName() throws Exception {
        mockMvc.perform(get("/api/main"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.selectedDeptName").value("Computer Engineering"));
    }
}
