package com.example.demo.service;

import com.example.demo.entity.CollegeSchool;
import com.example.demo.entity.Department;
import com.example.demo.entity.FacultyGroup;
import com.example.demo.repository.AdminLogRepository;
import com.example.demo.repository.CollegeSchoolRepository;
import com.example.demo.repository.CurriculumItemRepository;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.FacultyGroupRepository;
import com.example.demo.repository.NoticeRepository;
import com.example.demo.repository.PageVisitRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.ProfessorCourseAssignmentRepository;
import com.example.demo.repository.ProfessorRepository;
import com.example.demo.repository.UniversityRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceMonthlyStatsTest {

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

    @Test
    void deptMonthlyStatsCountsSignupsForTheDepartmentOnly() {
        Department dept = dept(300L, "Computer Science", 200L);
        when(departmentRepository.findById(300L)).thenReturn(Optional.of(dept));
        when(facultyGroupRepository.findById(200L)).thenReturn(Optional.of(faculty(200L, "Engineering", 100L)));
        when(collegeSchoolRepository.findById(100L)).thenReturn(Optional.of(school(100L, "College", 1L)));
        when(userRepository.countByUniversityIdAndDepartmentAndCreatedDateBetween(
            eq("1"), eq("Computer Science"), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(3L);

        List<Map<String, Object>> stats = adminService.getDeptMonthlyStats(300L);

        assertThat(stats).hasSize(6);
        assertThat(stats).allSatisfy(month -> assertThat(month.get("signups")).isEqualTo(3L));
        verify(userRepository, never()).countByUniversityIdAndCreatedDateBetween(
            eq("1"), any(LocalDateTime.class), any(LocalDateTime.class)
        );
    }

    @Test
    void facultyMonthlyStatsSumsSignupsForItsDepartments() {
        Department cs = dept(300L, "Computer Science", 200L);
        Department math = dept(301L, "Mathematics", 200L);
        when(facultyGroupRepository.findById(200L)).thenReturn(Optional.of(faculty(200L, "Engineering", 100L)));
        when(collegeSchoolRepository.findById(100L)).thenReturn(Optional.of(school(100L, "College", 1L)));
        when(departmentRepository.findByFacultyIdOrderByIdAsc(200L)).thenReturn(List.of(cs, math));
        when(userRepository.countByUniversityIdAndDepartmentAndCreatedDateBetween(
            eq("1"), eq("Computer Science"), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(2L);
        when(userRepository.countByUniversityIdAndDepartmentAndCreatedDateBetween(
            eq("1"), eq("Mathematics"), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(5L);

        List<Map<String, Object>> stats = adminService.getFacultyMonthlyStats(200L);

        assertThat(stats).hasSize(6);
        assertThat(stats).allSatisfy(month -> assertThat(month.get("signups")).isEqualTo(7L));
        verify(userRepository, never()).countByUniversityIdAndCreatedDateBetween(
            eq("1"), any(LocalDateTime.class), any(LocalDateTime.class)
        );
    }

    @Test
    void schoolMonthlyStatsAggregatesPostsAndVisitorsAcrossNestedScopes() {
        List<Long> facultyIds = List.of(200L, 201L);
        List<Long> deptIds = List.of(300L, 301L);
        when(collegeSchoolRepository.findByUniversityIdOrderByIdAsc(1L))
            .thenReturn(List.of(school(100L, "College", 1L)));
        when(facultyGroupRepository.findBySchoolIdOrderByIdAsc(100L))
            .thenReturn(List.of(
                faculty(200L, "Engineering", 100L),
                faculty(201L, "Science", 100L)
            ));
        when(departmentRepository.findByFacultyIdOrderByIdAsc(200L))
            .thenReturn(List.of(dept(300L, "Computer Science", 200L)));
        when(departmentRepository.findByFacultyIdOrderByIdAsc(201L))
            .thenReturn(List.of(dept(301L, "Mathematics", 201L)));
        when(userRepository.countByUniversityIdAndCreatedDateBetween(
            eq("1"), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(11L);
        when(postRepository.countByScopeTypeAndScopeIdAndCreatedDateBetween(
            eq("univ"), eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(1L);
        when(postRepository.countByScopeTypeAndScopeIdInAndCreatedDateBetween(
            eq("faculty"), eq(facultyIds), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(2L);
        when(postRepository.countByScopeTypeAndScopeIdInAndCreatedDateBetween(
            eq("dept"), eq(deptIds), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(3L);
        when(pageVisitRepository.countByScopeTypeAndScopeIdAndVisitedAtBetween(
            eq("univ"), eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(10L);
        when(pageVisitRepository.countByScopeTypeAndScopeIdInAndVisitedAtBetween(
            eq("faculty"), eq(facultyIds), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(20L);
        when(pageVisitRepository.countByScopeTypeAndScopeIdInAndVisitedAtBetween(
            eq("dept"), eq(deptIds), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(30L);

        List<Map<String, Object>> stats = adminService.getSchoolMonthlyStats(1L);

        assertThat(stats).hasSize(6);
        assertThat(stats).allSatisfy(month -> {
            assertThat(month.get("signups")).isEqualTo(11L);
            assertThat(month.get("posts")).isEqualTo(6L);
            assertThat(month.get("visitors")).isEqualTo(60L);
        });
    }

    private CollegeSchool school(Long id, String name, Long universityId) {
        CollegeSchool school = new CollegeSchool();
        school.setId(id);
        school.setName(name);
        school.setUniversityId(universityId);
        return school;
    }

    private FacultyGroup faculty(Long id, String name, Long schoolId) {
        FacultyGroup faculty = new FacultyGroup();
        faculty.setId(id);
        faculty.setName(name);
        faculty.setSchoolId(schoolId);
        return faculty;
    }

    private Department dept(Long id, String name, Long facultyId) {
        Department dept = new Department();
        dept.setId(id);
        dept.setName(name);
        dept.setFacultyId(facultyId);
        return dept;
    }
}
