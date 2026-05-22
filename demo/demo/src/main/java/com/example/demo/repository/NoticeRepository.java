package com.example.demo.repository;

import com.example.demo.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByScopeTypeAndScopeIdOrderByCreatedDateDesc(String scopeType, Long scopeId);
    long countByScopeTypeAndScopeId(String scopeType, Long scopeId);

    // Paginated notices for admin dashboards
    Page<Notice> findByScopeTypeAndScopeId(String scopeType, Long scopeId, Pageable pageable);
}
