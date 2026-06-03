package com.example.demo.repository;

import com.example.demo.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByScopeTypeAndScopeIdOrderByCreatedDateDesc(String scopeType, Long scopeId);
    Page<Post> findByScopeTypeAndScopeId(String scopeType, Long scopeId, Pageable pageable);
    long countByScopeTypeAndScopeId(String scopeType, Long scopeId);

    // Monthly stats: post count in a date range
    long countByScopeTypeAndScopeIdAndCreatedDateBetween(String scopeType, Long scopeId,
                                                          LocalDateTime start, LocalDateTime end);

    List<Post> findByAuthorUsernameOrderByCreatedDateDesc(String authorUsername);

    @Query("SELECT p.id FROM Post p WHERE p.scopeType = :scopeType AND p.scopeId = :scopeId")
    List<Long> findIdsByScopeTypeAndScopeId(@Param("scopeType") String scopeType,
                                             @Param("scopeId") Long scopeId);

    @Query(value = "SELECT COUNT(*) FROM POSTS p " +
                   "JOIN DEPTS d ON p.scope_type = 'dept' AND p.scope_id = d.id " +
                   "JOIN FACULTY_GROUPS fg ON d.faculty_id = fg.id " +
                   "JOIN COLLEGE_SCHOOLS cs ON fg.school_id = cs.id " +
                   "WHERE cs.university_id = :univId AND p.created_date > :since",
           nativeQuery = true)
    long countByUniversityId(@Param("univId") Long univId, @Param("since") LocalDateTime since);

    // 좋아요 내림차순 정렬 (동점 시 최신순)
    List<Post> findByScopeTypeAndScopeIdOrderByLikesDescCreatedDateDesc(
        String scopeType, Long scopeId);

    // 숨김 제외 — 일반 사용자 공개용 (hidden IS NULL OR hidden = false)
    @Query("SELECT p FROM Post p WHERE p.scopeType = :scopeType AND p.scopeId = :scopeId AND (p.hidden IS NULL OR p.hidden = false) ORDER BY p.createdDate DESC")
    List<Post> findVisibleByScopeTypeAndScopeId(@Param("scopeType") String scopeType, @Param("scopeId") Long scopeId);

    @Query("SELECT p FROM Post p WHERE p.scopeType = :scopeType AND p.scopeId = :scopeId AND (p.hidden IS NULL OR p.hidden = false) ORDER BY p.likes DESC, p.createdDate DESC")
    List<Post> findVisibleByScopeTypeAndScopeIdOrderByLikes(@Param("scopeType") String scopeType, @Param("scopeId") Long scopeId);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.scopeType = :scopeType AND p.scopeId = :scopeId AND (p.hidden IS NULL OR p.hidden = false)")
    long countVisibleByScopeTypeAndScopeId(@Param("scopeType") String scopeType, @Param("scopeId") Long scopeId);
}
