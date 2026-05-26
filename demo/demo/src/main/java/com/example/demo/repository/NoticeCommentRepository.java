package com.example.demo.repository;

import com.example.demo.entity.NoticeComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface NoticeCommentRepository extends JpaRepository<NoticeComment, Long> {
    List<NoticeComment> findByNoticeIdOrderByCreatedDateAsc(Long noticeId);
    long countByNoticeId(Long noticeId);
    long countByNoticeIdInAndCreatedDateAfter(List<Long> noticeIds, LocalDate since);
}
