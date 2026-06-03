package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.dto.ScheduleDto;
import com.example.demo.repository.PageVisitRepository;
import com.example.demo.service.ScheduleService;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ScheduleController.class)
class ScheduleControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean ScheduleService scheduleService;
    @MockitoBean PageVisitRepository pageVisitRepository;

    @BeforeEach
    void setUp() {
        when(scheduleService.getSchedulesByDept(1L))
                .thenReturn(List.of(new ScheduleDto(1L, "Academic calendar", "2026-06-02", 0, "school")));
    }

    @Test
    @DisplayName("GET /api/schedules → 200 OK, JSON 배열 반환")
    void apiSchedules_returns200_withArray() throws Exception {
        mockMvc.perform(get("/api/schedules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/schedules → 각 항목에 title·date·dday·category 포함")
    void apiSchedules_itemsHaveRequiredFields() throws Exception {
        mockMvc.perform(get("/api/schedules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").isString())
                .andExpect(jsonPath("$[0].date").isString())
                .andExpect(jsonPath("$[0].dday").isNumber())
                .andExpect(jsonPath("$[0].category").isString());
    }
}
