package com.example.demo.repository;

import com.example.demo.entity.NoticeAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoticeAttachmentRepository extends JpaRepository<NoticeAttachment, Long> {
    List<NoticeAttachment> findByNoticeIdOrderByIdAsc(Long noticeId);
    void deleteByNoticeId(Long noticeId);
}
