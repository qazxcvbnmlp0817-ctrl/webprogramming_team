package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 학과정보 페이지 컨트롤러 테스트 — 연결: DepartmentController → department/index.html */
@WebMvcTest(DepartmentController.class)
class DepartmentControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("학과정보 GET /department → 200 OK, department/index 뷰")
    void 학과정보페이지_정상_로드() throws Exception {
        mockMvc.perform(get("/department"))
                .andExpect(status().isOk())
                .andExpect(view().name("department/index"))
                .andExpect(model().attribute("currentPage", "department"));
    }
}
