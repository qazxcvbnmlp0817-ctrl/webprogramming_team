package com.example.demo.service;

import com.example.demo.dto.ActivityDto;
import com.example.demo.entity.Department;
import com.example.demo.entity.FacultyGroup;
import com.example.demo.entity.University;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private final PageVisitRepository    pageVisitRepository;
    private final PostRepository         postRepository;
    private final CommentRepository      commentRepository;
    private final NoticeRepository       noticeRepository;
    private final NoticeCommentRepository noticeCommentRepository;
    private final UniversityRepository   universityRepository;
    private final DepartmentRepository   departmentRepository;
    private final FacultyGroupRepository facultyGroupRepository;

    public ActivityService(PageVisitRepository pageVisitRepository,
                           PostRepository postRepository,
                           CommentRepository commentRepository,
                           NoticeRepository noticeRepository,
                           NoticeCommentRepository noticeCommentRepository,
                           UniversityRepository universityRepository,
                           DepartmentRepository departmentRepository,
                           FacultyGroupRepository facultyGroupRepository) {
        this.pageVisitRepository    = pageVisitRepository;
        this.postRepository         = postRepository;
        this.commentRepository      = commentRepository;
        this.noticeRepository       = noticeRepository;
        this.noticeCommentRepository = noticeCommentRepository;
        this.universityRepository   = universityRepository;
        this.departmentRepository   = departmentRepository;
        this.facultyGroupRepository = facultyGroupRepository;
    }

    public List<ActivityDto> getActivityRanking(String scopeType) {
        LocalDate sinceDate = LocalDate.now().minusDays(7);
        LocalDateTime sinceTime = sinceDate.atStartOfDay();

        List<ActivityDto> result;
        switch (scopeType) {
            case "univ": {
                List<University> all = universityRepository.findAll();
                result = all.stream()
                        .map(u -> buildDtoForUniv(u.getId(), u.getName(), sinceDate, sinceTime))
                        .collect(Collectors.toList());
                break;
            }
            case "dept": {
                List<Department> all = departmentRepository.findAll();
                result = all.stream()
                        .map(d -> buildDto(d.getId(), "dept", d.getName(), sinceDate, sinceTime))
                        .collect(Collectors.toList());
                break;
            }
            case "faculty": {
                List<FacultyGroup> all = facultyGroupRepository.findAll();
                result = all.stream()
                        .map(f -> buildDto(f.getId(), "faculty", f.getName(), sinceDate, sinceTime))
                        .collect(Collectors.toList());
                break;
            }
            default:
                return Collections.emptyList();
        }

        // Normalize: prevent division by zero with orElse(1)
        long maxV = result.stream().mapToLong(ActivityDto::getWeeklyVisitors).max().orElse(1);
        long maxP = result.stream().mapToLong(ActivityDto::getNewPosts).max().orElse(1);
        long maxC = result.stream().mapToLong(ActivityDto::getNewComments).max().orElse(1);

        result.forEach(d -> {
            double score = 20.0 * d.getWeeklyVisitors() / maxV
                         + 35.0 * d.getNewPosts()       / maxP
                         + 45.0 * d.getNewComments()    / maxC;
            d.setActivityScore(Math.round(score * 10) / 10.0);
        });

        result.sort(Comparator.comparingDouble(ActivityDto::getActivityScore).reversed()
                              .thenComparing(Comparator.comparingLong(ActivityDto::getNewPosts).reversed())
                              .thenComparing(Comparator.comparingLong(ActivityDto::getNewComments).reversed()));

        return result;
    }

    private ActivityDto buildDto(Long scopeId, String scopeType, String name,
                                  LocalDate sinceDate, LocalDateTime sinceTime) {
        long visitors = pageVisitRepository
                .countByScopeTypeAndScopeIdAndVisitedAtAfter(scopeType, scopeId, sinceTime);

        long newPosts = postRepository
                .countByScopeTypeAndScopeIdAndCreatedDateBetween(scopeType, scopeId,
                        sinceTime, LocalDateTime.now());

        long postComments   = commentRepository.countByScopeAndSince(scopeType, scopeId, sinceDate);
        long noticeComments = noticeCommentRepository.countByScopeAndSince(scopeType, scopeId, sinceDate);

        return new ActivityDto(scopeId, scopeType, name,
                visitors, newPosts, postComments + noticeComments);
    }

    private ActivityDto buildDtoForUniv(Long univId, String name,
                                         LocalDate sinceDate, LocalDateTime sinceTime) {
        long visitors    = pageVisitRepository.countByUniversityId(univId, sinceTime);
        long newPosts    = postRepository.countByUniversityId(univId, sinceTime);
        long newComments = commentRepository.countByUniversityId(univId, sinceDate)
                         + noticeCommentRepository.countByUniversityId(univId, sinceDate);
        return new ActivityDto(univId, "univ", name, visitors, newPosts, newComments);
    }
}
