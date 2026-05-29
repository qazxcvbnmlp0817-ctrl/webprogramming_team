package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.PageVisitRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SchoolAdminController.class)
class SchoolAdminRoleControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    AdminService adminService;

    @MockitoBean
    UserRepository userRepository;

    @MockitoBean
    PageVisitRepository pageVisitRepository;

    @BeforeEach
    void setUp() {
        User schoolAdminUser = new User();
        schoolAdminUser.setUsername("school_admin");
        schoolAdminUser.setName("학교관리자");
        schoolAdminUser.setAdminRole("SCHOOL_ADMIN");
        schoolAdminUser.setUniversityId("1");

        when(userRepository.findByUsername("school_admin"))
                .thenReturn(Optional.of(schoolAdminUser));
        when(adminService.updateUserRole(anyLong(), anyString(), anyString(), anyLong()))
                .thenReturn(Map.of("success", true, "userId", 99L));
    }

    @Test
    void schoolAdmin_deptAdmin역할_부여_200() throws Exception {
        mockMvc.perform(put("/api/admin/school/users/99/role")
                        .header("X-Username", "school_admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"DEPT_ADMIN\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void schoolAdmin_schoolAdmin역할_부여_200() throws Exception {
        mockMvc.perform(put("/api/admin/school/users/99/role")
                        .header("X-Username", "school_admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"SCHOOL_ADMIN\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void schoolAdmin_superAdmin역할_부여시_403() throws Exception {
        mockMvc.perform(put("/api/admin/school/users/99/role")
                        .header("X-Username", "school_admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"SUPER_ADMIN\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void schoolAdmin_역할_박탈_200() throws Exception {
        mockMvc.perform(put("/api/admin/school/users/99/role")
                        .header("X-Username", "school_admin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"\"}"))
                .andExpect(status().isOk());
    }
}
