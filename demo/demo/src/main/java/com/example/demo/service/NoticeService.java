package com.example.demo.service;

import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.NoticeWriteRequestDto;
import com.example.demo.entity.Notice;
import com.example.demo.repository.NoticeRepository;
import com.example.demo.util.DummyDataHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticeService {

    private final NoticeRepository noticeRepository;

    public NoticeService(NoticeRepository noticeRepository) {
        this.noticeRepository = noticeRepository;
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

    public Notice create(NoticeWriteRequestDto req) {
        Notice notice = new Notice();
        notice.setTitle(req.getTitle());
        notice.setContent(req.getContent());
        notice.setAuthor(req.getAuthor());
        notice.setCategory(req.getCategory());
        notice.setScopeType(req.getScopeType());
        notice.setScopeId(req.getScopeId());
        notice.setViewCount(0);
        notice.setFeatured(false);
        notice.setCreatedDate(LocalDate.now());
        return noticeRepository.save(notice);
    }

    private NoticeDto toDto(Notice n) {
        return new NoticeDto(
                n.getId(),
                n.getTitle(),
                n.getCreatedDate().toString(),
                n.getAuthor(),
                n.getCategory(),
                n.getViewCount(),
                n.isFeatured()
        );
    }
}
