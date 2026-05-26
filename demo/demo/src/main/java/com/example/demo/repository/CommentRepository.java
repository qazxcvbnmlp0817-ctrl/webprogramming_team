package com.example.demo.repository;

import com.example.demo.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByCreatedDateAsc(Long postId);
    long countByPostId(Long postId);
    List<Comment> findByAuthorUsernameOrderByCreatedDateDesc(String authorUsername);
    long countByPostIdInAndCreatedDateAfter(List<Long> postIds, LocalDate since);
}
