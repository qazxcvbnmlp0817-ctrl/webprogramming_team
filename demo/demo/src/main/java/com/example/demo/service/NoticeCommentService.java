package com.example.demo.service;

import com.example.demo.dto.NoticeCommentDto;
import com.example.demo.dto.NoticeCommentWriteRequestDto;
import com.example.demo.entity.NoticeComment;
import com.example.demo.repository.NoticeCommentRepository;
import com.example.demo.repository.NoticeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticeCommentService {

    private final NoticeCommentRepository commentRepository;
    private final NoticeRepository noticeRepository;

    public NoticeCommentService(NoticeCommentRepository commentRepository,
                                NoticeRepository noticeRepository) {
        this.commentRepository = commentRepository;
        this.noticeRepository  = noticeRepository;
    }

    public List<NoticeCommentDto> getByNoticeId(Long noticeId) {
        return commentRepository.findByNoticeIdOrderByCreatedDateAsc(noticeId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public NoticeCommentDto add(Long noticeId, NoticeCommentWriteRequestDto req) {
        NoticeComment c = new NoticeComment();
        c.setNoticeId(noticeId);
        c.setAuthor(req.getAuthor());
        c.setAuthorUsername(req.getAuthorUsername());
        c.setContent(req.getContent());
        c.setCreatedDate(LocalDate.now());
        NoticeComment saved = commentRepository.save(c);

        noticeRepository.findById(noticeId).ifPresent(notice -> {
            notice.setCommentCount((int) commentRepository.countByNoticeId(noticeId));
            noticeRepository.save(notice);
        });

        return toDto(saved);
    }

    @Transactional
    public NoticeCommentDto update(Long noticeId, Long commentId, NoticeCommentWriteRequestDto req) {
        NoticeComment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!c.getNoticeId().equals(noticeId))
            throw new RuntimeException("Comment does not belong to this notice");
        if (!c.getAuthorUsername().equals(req.getAuthorUsername()))
            throw new RuntimeException("No permission");
        c.setContent(req.getContent());
        c.setModifiedDate(LocalDate.now());
        return toDto(commentRepository.save(c));
    }

    @Transactional
    public void delete(Long noticeId, Long commentId, String username, String memberType) {
        NoticeComment c = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        boolean isAdmin = "admin".equals(memberType);
        if (!isAdmin && !c.getAuthorUsername().equals(username))
            throw new RuntimeException("No permission");
        commentRepository.deleteById(commentId);
        noticeRepository.findById(noticeId).ifPresent(notice -> {
            notice.setCommentCount((int) commentRepository.countByNoticeId(noticeId));
            noticeRepository.save(notice);
        });
    }

    private NoticeCommentDto toDto(NoticeComment c) {
        return new NoticeCommentDto(c.getId(), c.getNoticeId(), c.getAuthor(),
                                    c.getAuthorUsername(), c.getContent(),
                                    c.getCreatedDate().toString());
    }
}
