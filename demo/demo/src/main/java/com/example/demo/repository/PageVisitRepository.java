package com.example.demo.repository;

import com.example.demo.entity.PageVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PageVisitRepository extends JpaRepository<PageVisit, Long> {
    List<PageVisit> findByVisitedAtAfter(LocalDateTime since);
    List<PageVisit> findByScopeTypeAndScopeIdAndVisitedAtAfter(String scopeType, Long scopeId, LocalDateTime since);
    long countByScopeTypeAndScopeIdAndVisitedAtAfter(String scopeType, Long scopeId, LocalDateTime since);

    // Aggregated: multiple scope IDs (use only when list is non-empty)
    List<PageVisit> findByScopeTypeAndScopeIdInAndVisitedAtAfter(String scopeType, List<Long> scopeIds, LocalDateTime since);
    long countByScopeTypeAndScopeIdInAndVisitedAtAfter(String scopeType, List<Long> scopeIds, LocalDateTime since);

    // Monthly range query — single scope ID
    long countByScopeTypeAndScopeIdAndVisitedAtBetween(String scopeType, Long scopeId,
                                                        LocalDateTime start, LocalDateTime end);

    // Monthly range query — multiple scope IDs (use only when list is non-empty)
    long countByScopeTypeAndScopeIdInAndVisitedAtBetween(String scopeType, List<Long> scopeIds,
                                                          LocalDateTime start, LocalDateTime end);

    @Query(value = "SELECT COUNT(*) FROM PAGE_VISITS pv " +
                   "JOIN DEPTS d ON pv.scope_type = 'dept' AND pv.scope_id = d.id " +
                   "JOIN FACULTY_GROUPS fg ON d.faculty_id = fg.id " +
                   "JOIN COLLEGE_SCHOOLS cs ON fg.school_id = cs.id " +
                   "WHERE cs.university_id = :univId AND pv.visited_at > :since",
           nativeQuery = true)
    long countByUniversityId(@Param("univId") Long univId, @Param("since") LocalDateTime since);
}
