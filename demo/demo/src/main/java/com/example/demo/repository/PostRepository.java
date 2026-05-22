package com.example.demo.repository;

import com.example.demo.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByScopeTypeAndScopeIdOrderByCreatedDateDesc(String scopeType, Long scopeId);
    Page<Post> findByScopeTypeAndScopeId(String scopeType, Long scopeId, Pageable pageable);
    long countByScopeTypeAndScopeId(String scopeType, Long scopeId);

    // Monthly stats: post count in a date range
    long countByScopeTypeAndScopeIdAndCreatedDateBetween(String scopeType, Long scopeId,
                                                          LocalDateTime start, LocalDateTime end);
}
