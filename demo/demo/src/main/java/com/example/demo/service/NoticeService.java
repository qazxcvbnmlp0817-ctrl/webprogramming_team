package com.example.demo.service;

import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.NoticeWriteRequestDto;
import com.example.demo.dto.PostAttachmentDto;
import com.example.demo.entity.Notice;
import com.example.demo.entity.NoticeAttachment;
import com.example.demo.repository.NoticeAttachmentRepository;
import com.example.demo.repository.NoticeRepository;
import com.example.demo.util.DummyDataHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NoticeService {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    private final NoticeRepository noticeRepository;
    private final NoticeAttachmentRepository attachmentRepository;

    public NoticeService(NoticeRepository noticeRepository,
                         NoticeAttachmentRepository attachmentRepository) {
        this.noticeRepository = noticeRepository;
        this.attachmentRepository = attachmentRepository;
    }

    public List<NoticeDto> getNoticesByDept(Long deptId) {
        List<Notice> notices = noticeRepository
                .findByScopeTypeAndScopeIdOrderByCreatedDateDesc("dept", deptId);
        if (notices.isEmpty()) return DummyDataHelper.getNoticesByDept(deptId);
        return notices.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<NoticeDto> getNoticesByFaculty(Long facultyId) {
        List<Notice> notices = noticeRepository
                .findByScopeTypeAndScopeIdOrderByCreatedDateDesc("faculty", facultyId);
        if (notices.isEmpty()) return DummyDataHelper.getNoticesByFaculty(facultyId);
        return notices.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<NoticeDto> getNoticesByUniv(Long univId) {
        List<Notice> notices = noticeRepository
                .findByScopeTypeAndScopeIdOrderByCreatedDateDesc("univ", univId);
        if (notices.isEmpty()) return DummyDataHelper.getUniversityNotices(univId);
        return notices.stream().map(this::toDto).collect(Collectors.toList());
    }

    public Optional<NoticeDto> findById(Long id) {
        return noticeRepository.findById(id).map(n -> {
            n.setViewCount(n.getViewCount() + 1);
            noticeRepository.save(n);
            return toDtoFull(n);
        });
    }

    @Transactional
    public Notice create(NoticeWriteRequestDto req) {
        Notice notice = new Notice();
        notice.setTitle(req.getTitle());
        notice.setContent(req.getContent());
        notice.setAuthor(req.getAuthor());
        notice.setCategory(req.getCategory());
        notice.setScopeType(req.getScopeType());
        notice.setScopeId(req.getScopeId());
        notice.setTargetGrades(gradesToString(req.getTargetGrades()));
        notice.setViewCount(0);
        notice.setFeatured(false);
        notice.setCreatedDate(LocalDateTime.now());
        notice.setAuthorUsername(req.getAuthorUsername());
        Notice saved = noticeRepository.save(notice);

        if (req.getAttachments() != null) {
            for (PostAttachmentDto a : req.getAttachments()) {
                NoticeAttachment entity = new NoticeAttachment();
                entity.setNoticeId(saved.getId());
                entity.setOriginalName(a.getOriginalName());
                entity.setSavedName(a.getUrl().replace("/uploads/", ""));
                entity.setFileSize(a.getFileSize());
                entity.setFileType(a.getFileType() != null ? a.getFileType() : "");
                entity.setImage(a.isImage());
                attachmentRepository.save(entity);
            }
        }
        return saved;
    }

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private List<PostAttachmentDto> fetchAttachments(Long noticeId) {
        return attachmentRepository.findByNoticeIdOrderByIdAsc(noticeId)
                .stream()
                .map(a -> new PostAttachmentDto(
                        a.getId(), a.getOriginalName(), "/uploads/" + a.getSavedName(),
                        a.getFileSize(), a.getFileType(), a.isImage()))
                .collect(Collectors.toList());
    }

    private NoticeDto toDto(Notice n) {
        return new NoticeDto(
                n.getId(),
                n.getTitle(),
                n.getCreatedDate().format(FMT),
                n.getAuthor(),
                n.getCategory(),
                n.getViewCount(),
                n.isFeatured(),
                parseGrades(n.getTargetGrades()),
                null,
                fetchAttachments(n.getId())
        );
    }

    private NoticeDto toDtoFull(Notice n) {
        return new NoticeDto(
                n.getId(),
                n.getTitle(),
                n.getCreatedDate().format(FMT),
                n.getAuthor(),
                n.getCategory(),
                n.getViewCount(),
                n.isFeatured(),
                parseGrades(n.getTargetGrades()),
                n.getContent(),
                fetchAttachments(n.getId()),
                n.getAuthorUsername()
        );
    }

    @Transactional
    public void update(Long id, NoticeWriteRequestDto req) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found"));
        notice.setTitle(req.getTitle());
        notice.setContent(req.getContent());
        notice.setCategory(req.getCategory());
        notice.setTargetGrades(gradesToString(req.getTargetGrades()));
        noticeRepository.save(notice);
    }

    @Transactional
    public void delete(Long id) {
        List<NoticeAttachment> attachments = attachmentRepository.findByNoticeIdOrderByIdAsc(id);
        for (NoticeAttachment a : attachments) {
            try { Files.deleteIfExists(Paths.get(uploadDir, a.getSavedName())); }
            catch (IOException ignored) {}
        }
        attachmentRepository.deleteByNoticeId(id);
        noticeRepository.deleteById(id);
    }

    private String gradesToString(List<Integer> grades) {
        if (grades == null || grades.isEmpty()) return "1,2,3,4";
        return grades.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private List<Integer> parseGrades(String raw) {
        if (raw == null || raw.isBlank()) return List.of(1, 2, 3, 4);
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toList());
    }
}
