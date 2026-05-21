package com.example.demo.repository;

import com.example.demo.entity.PostAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostAttachmentRepository extends JpaRepository<PostAttachment, Long> {
    List<PostAttachment> findByPostIdOrderByIdAsc(Long postId);
    void deleteByPostId(Long postId);
}
