package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.repository.PageVisitRepository;
import com.example.demo.service.UniversityService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// 학과정보 페이지는 React SPA에서 처리. SPA 폴백 경로 테스트.
@WebMvcTest({DepartmentController.class, SpaController.class})
class DepartmentControllerTest {

    @Autowired MockMvc mockMvc;

    @MockitoBean UniversityService universityService;
    @MockitoBean PageVisitRepository pageVisitRepository;

    @Test
    @DisplayName("GET /department → SPA index.html 포워딩")
    void departmentRoute_forwardsToSpa() throws Exception {
        mockMvc.perform(get("/department"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }
}
