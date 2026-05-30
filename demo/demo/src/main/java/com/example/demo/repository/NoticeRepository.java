package com.example.demo.repository;

import com.example.demo.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByScopeTypeAndScopeIdOrderByCreatedDateDesc(String scopeType, Long scopeId);
    long countByScopeTypeAndScopeId(String scopeType, Long scopeId);

    // Paginated notices for admin dashboards
    Page<Notice> findByScopeTypeAndScopeId(String scopeType, Long scopeId, Pageable pageable);

    @Query("SELECT n.id FROM Notice n WHERE n.scopeType = :scopeType AND n.scopeId = :scopeId")
    List<Long> findIdsByScopeTypeAndScopeId(@Param("scopeType") String scopeType,
                                             @Param("scopeId") Long scopeId);

    // 숨김 제외 — 일반 사용자 공개용
    @Query("SELECT n FROM Notice n WHERE n.scopeType = :scopeType AND n.scopeId = :scopeId AND (n.hidden IS NULL OR n.hidden = false) ORDER BY n.createdDate DESC")
    List<Notice> findVisibleByScopeTypeAndScopeId(@Param("scopeType") String scopeType, @Param("scopeId") Long scopeId);

    @Query("SELECT COUNT(n) FROM Notice n WHERE n.scopeType = :scopeType AND n.scopeId = :scopeId AND (n.hidden IS NULL OR n.hidden = false)")
    long countVisibleByScopeTypeAndScopeId(@Param("scopeType") String scopeType, @Param("scopeId") Long scopeId);
}
