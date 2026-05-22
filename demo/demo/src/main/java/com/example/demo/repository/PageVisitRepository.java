package com.example.demo.repository;

import com.example.demo.entity.PageVisit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PageVisitRepository extends JpaRepository<PageVisit, Long> {
    List<PageVisit> findByVisitedAtAfter(LocalDateTime since);
    List<PageVisit> findByScopeTypeAndScopeIdAndVisitedAtAfter(String scopeType, Long scopeId, LocalDateTime since);
    long countByScopeTypeAndScopeIdAndVisitedAtAfter(String scopeType, Long scopeId, LocalDateTime since);

    // Aggregated: multiple scope IDs (use only when list is non-empty)
    List<PageVisit> findByScopeTypeAndScopeIdInAndVisitedAtAfter(String scopeType, List<Long> scopeIds, LocalDateTime since);
    long countByScopeTypeAndScopeIdInAndVisitedAtAfter(String scopeType, List<Long> scopeIds, LocalDateTime since);

    // Monthly range query
    long countByScopeTypeAndScopeIdAndVisitedAtBetween(String scopeType, Long scopeId,
                                                        LocalDateTime start, LocalDateTime end);
}
