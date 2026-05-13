// demo/demo/src/test/java/com/example/demo/controller/SchoolControllerTest.java
package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SchoolController.class)
class SchoolControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    @DisplayName("GET /schools (대학교 세션 있음) → 200 OK, 모델에 schools 포함")
    void showSchools_returns200_withSchoolsInModel() throws Exception {
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("selectedUniversityId",   1L);
        session.setAttribute("selectedUniversityName", "목포대학교");

        mockMvc.perform(get("/schools").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("school/index"))
                .andExpect(model().attributeExists("schools"));
    }

    @Test
    @DisplayName("GET /schools (대학교 세션 없음) → /universities 리다이렉트")
    void showSchools_noUniversitySession_redirectsToUniversities() throws Exception {
        mockMvc.perform(get("/schools"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/universities"));
    }

    @Test
    @DisplayName("POST /schools/select → 세션에 학과명·학교명·학과ID 저장 후 / 리다이렉트")
    void selectDept_storesSessionAttributes_andRedirectsToRoot() throws Exception {
        MockHttpSession session = new MockHttpSession();

        mockMvc.perform(post("/schools/select")
                        .param("deptId", "1")
                        .param("deptName", "컴퓨터공학과")
                        .param("schoolName", "공과대학")
                        .session(session))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"));

        assertThat(session.getAttribute("selectedDeptName")).isEqualTo("컴퓨터공학과");
        assertThat(session.getAttribute("selectedSchoolName")).isEqualTo("공과대학");
        assertThat(session.getAttribute("selectedDeptId")).isEqualTo(1L);
    }

    @Test
    @DisplayName("GET /faculty/{id} → 200 OK, school/faculty-placeholder 뷰 반환")
    void facultyPlaceholder_returns200() throws Exception {
        mockMvc.perform(get("/faculty/1"))
                .andExpect(status().isOk())
                .andExpect(view().name("school/faculty-placeholder"));
    }
}
