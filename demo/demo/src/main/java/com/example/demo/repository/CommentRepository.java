package com.example.demo.repository;

import com.example.demo.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByCreatedDateAsc(Long postId);
    List<Comment> findByParentId(Long parentId);
    long countByPostId(Long postId);
    List<Comment> findByAuthorUsernameOrderByCreatedDateDesc(String authorUsername);
    long countByPostIdInAndCreatedDateAfter(List<Long> postIds, LocalDate since);

    @Query(value = "SELECT COUNT(*) FROM COMMENTS c JOIN POSTS p ON c.post_id = p.id " +
                   "WHERE p.scope_type = :scopeType AND p.scope_id = :scopeId AND c.created_date > :since",
           nativeQuery = true)
    long countByScopeAndSince(@Param("scopeType") String scopeType,
                               @Param("scopeId") Long scopeId,
                               @Param("since") LocalDate since);

    @Query(value = "SELECT COUNT(*) FROM COMMENTS c " +
                   "JOIN POSTS p ON c.post_id = p.id " +
                   "JOIN DEPTS d ON p.scope_type = 'dept' AND p.scope_id = d.id " +
                   "JOIN FACULTY_GROUPS fg ON d.faculty_id = fg.id " +
                   "JOIN COLLEGE_SCHOOLS cs ON fg.school_id = cs.id " +
                   "WHERE cs.university_id = :univId AND c.created_date > :since",
           nativeQuery = true)
    long countByUniversityId(@Param("univId") Long univId, @Param("since") LocalDate since);
}
