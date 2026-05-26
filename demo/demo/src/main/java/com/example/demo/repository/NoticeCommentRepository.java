package com.example.demo.repository;

import com.example.demo.entity.NoticeComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface NoticeCommentRepository extends JpaRepository<NoticeComment, Long> {
    List<NoticeComment> findByNoticeIdOrderByCreatedDateAsc(Long noticeId);
    long countByNoticeId(Long noticeId);
    long countByNoticeIdInAndCreatedDateAfter(List<Long> noticeIds, LocalDate since);

    @Query(value = "SELECT COUNT(*) FROM NOTICE_COMMENTS nc JOIN NOTICES n ON nc.notice_id = n.id " +
                   "WHERE n.scope_type = :scopeType AND n.scope_id = :scopeId AND nc.created_date > :since",
           nativeQuery = true)
    long countByScopeAndSince(@Param("scopeType") String scopeType,
                               @Param("scopeId") Long scopeId,
                               @Param("since") LocalDate since);

    @Query(value = "SELECT COUNT(*) FROM NOTICE_COMMENTS nc " +
                   "JOIN NOTICES n ON nc.notice_id = n.id " +
                   "JOIN DEPTS d ON n.scope_type = 'dept' AND n.scope_id = d.id " +
                   "JOIN FACULTY_GROUPS fg ON d.faculty_id = fg.id " +
                   "JOIN COLLEGE_SCHOOLS cs ON fg.school_id = cs.id " +
                   "WHERE cs.university_id = :univId AND nc.created_date > :since",
           nativeQuery = true)
    long countByUniversityId(@Param("univId") Long univId, @Param("since") LocalDate since);
}
