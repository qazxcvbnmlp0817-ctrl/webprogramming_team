package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MainController.class)
class MainControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/main → 200 OK, JSON에 notices·posts·schedules 포함")
    void apiMain_returns200_withData() throws Exception {
        mockMvc.perform(get("/api/main"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notices").isArray())
                .andExpect(jsonPath("$.posts").isArray())
                .andExpect(jsonPath("$.schedules").isArray())
                .andExpect(jsonPath("$.today").isString());
    }

    @Test
    @DisplayName("GET /api/main?deptName=컴퓨터공학과 → selectedDeptName 반환")
    void apiMain_withDeptName_returnsDeptName() throws Exception {
        mockMvc.perform(get("/api/main").param("deptName", "컴퓨터공학과"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.selectedDeptName").value("컴퓨터공학과"));
    }
}
