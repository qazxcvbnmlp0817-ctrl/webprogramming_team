package com.example.demo.service;

import com.example.demo.dto.ActivityDto;
import com.example.demo.entity.Department;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.FacultyGroupRepository;
import com.example.demo.repository.NoticeCommentRepository;
import com.example.demo.repository.NoticeRepository;
import com.example.demo.repository.PageVisitRepository;
import com.example.demo.repository.PostRepository;
import com.example.demo.repository.UniversityRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

    @Mock PageVisitRepository pageVisitRepository;
    @Mock PostRepository postRepository;
    @Mock CommentRepository commentRepository;
    @Mock NoticeRepository noticeRepository;
    @Mock NoticeCommentRepository noticeCommentRepository;
    @Mock UniversityRepository universityRepository;
    @Mock DepartmentRepository departmentRepository;
    @Mock FacultyGroupRepository facultyGroupRepository;

    @InjectMocks ActivityService activityService;

    @Test
    void activityRankingUsesZeroScoreWhenAllMetricsAreZero() {
        when(departmentRepository.findAll()).thenReturn(List.of(
            dept(1L, "Computer Science"),
            dept(2L, "Business")
        ));

        List<ActivityDto> ranking = activityService.getActivityRanking("dept");

        assertThat(ranking).hasSize(2);
        assertThat(ranking)
            .allSatisfy(dto -> {
                assertThat(Double.isNaN(dto.getActivityScore())).isFalse();
                assertThat(dto.getActivityScore()).isEqualTo(0.0);
            });
    }

    private Department dept(Long id, String name) {
        Department dept = new Department();
        dept.setId(id);
        dept.setName(name);
        dept.setFacultyId(10L);
        return dept;
    }
}
