package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceRoleTest {

    @Mock UserRepository userRepository;
    @Mock PageVisitRepository pageVisitRepository;
    @Mock PostRepository postRepository;
    @Mock NoticeRepository noticeRepository;
    @Mock UniversityRepository universityRepository;
    @Mock CollegeSchoolRepository collegeSchoolRepository;
    @Mock FacultyGroupRepository facultyGroupRepository;
    @Mock DepartmentRepository departmentRepository;
    @Mock AdminLogRepository adminLogRepository;
    @Mock ProfessorRepository professorRepository;
    @Mock CurriculumItemRepository curriculumItemRepository;
    @Mock ProfessorCourseAssignmentRepository assignmentRepository;

    @InjectMocks AdminService adminService;

    private User makeUser(String memberType, String adminRole) {
        User u = new User();
        u.setId(1L);
        u.setUsername("testuser");
        u.setMemberType(memberType);
        u.setAdminRole(adminRole);
        u.setUniversityId("1");
        return u;
    }

    @Test
    void dept_admin에게_school_admin_부여_성공() {
        User user = makeUser("professor", "DEPT_ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(adminLogRepository.save(any())).thenReturn(null);

        var result = adminService.updateUserRole(1L, "SCHOOL_ADMIN", "actor", 1L);

        assertThat(result.get("success")).isEqualTo(true);
        assertThat(user.getAdminRole()).isEqualTo("SCHOOL_ADMIN");
    }

    @Test
    void school_admin에게_dept_admin_부여시_422() {
        User user = makeUser("professor", "SCHOOL_ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() ->
            adminService.updateUserRole(1L, "DEPT_ADMIN", "actor", 1L))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("이미 상위 역할")
            .extracting(e -> ((ResponseStatusException) e).getStatusCode().value())
            .isEqualTo(422);
    }

    @Test
    void admin_타입_역할_박탈시_422() {
        User user = makeUser("admin", "SCHOOL_ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() ->
            adminService.updateUserRole(1L, "", "actor", 1L))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("admin 계정은 최소 1개의 역할")
            .extracting(e -> ((ResponseStatusException) e).getStatusCode().value())
            .isEqualTo(422);
    }

    @Test
    void professor_타입_역할_박탈_성공() {
        User user = makeUser("professor", "DEPT_ADMIN");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(adminLogRepository.save(any())).thenReturn(null);

        var result = adminService.updateUserRole(1L, "", "actor", 1L);

        assertThat(result.get("success")).isEqualTo(true);
        assertThat(user.getAdminRole()).isNull();
    }

    @Test
    void 역할_없는_사용자에게_school_admin_부여_성공() {
        // given
        User user = new User();
        user.setId(10L);
        user.setUsername("new_admin");
        user.setAdminRole(null);   // 현재 역할 없음
        user.setMemberType("professor");
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(adminLogRepository.save(any())).thenReturn(null);

        // when
        Map<String, Object> result = adminService.updateUserRole(10L, "SCHOOL_ADMIN", "actor", 1L);

        // then
        assertEquals(true, result.get("success"));
        assertEquals("SCHOOL_ADMIN", user.getAdminRole());
    }
}
