package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "SCHEDULES")
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String content;

    // PERSONAL | COURSE | DEPARTMENT | SCHOOL | GLOBAL
    // (구) DEPT_NOTICE | GLOBAL_NOTICE | GRADE_NOTICE 도 하위 호환 유지
    @Column(name = "schedule_type", length = 30)
    private String scheduleType;

    @Column(name = "university_id", length = 50)
    private String universityId; // SCHOOL/GLOBAL 범위 결정용

    @Column(name = "owner_id")
    private Long ownerId; // 개인 일정 소유자

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "target_grade")
    private Integer targetGrade; // 단일 학년 (하위 호환)

    @Column(name = "target_grades_json", length = 50)
    private String targetGradesJson; // 다중 학년: "1,2,3" 형식

    @Column(name = "is_all_grades")
    private Boolean isAllGrades = false;

    // meeting|task|exam|personal|academic|event|other|course 등 영문 key
    @Column(length = 20)
    private String category;

    @Column(name = "is_completed")
    private boolean isCompleted = false;

    @Column(name = "start_date")
    private LocalDate startDate;

    // ── 구 스키마 호환 컬럼 (NOT NULL 제약 유지) ─────────────────────────────────
    @Column(name = "event_date")
    private LocalDate eventDate;        // start_date 와 동일값

    @Column(name = "scope_type", length = 30)
    private String scopeType;           // "personal" 등 기본값

    @Column(name = "scope_id")
    private Long scopeId;               // 0 기본값

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_time", length = 10)
    private String startTime;

    @Column(name = "end_time", length = 10)
    private String endTime;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getScheduleType() { return scheduleType; }
    public void setScheduleType(String scheduleType) { this.scheduleType = scheduleType; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Integer getTargetGrade() { return targetGrade; }
    public void setTargetGrade(Integer targetGrade) { this.targetGrade = targetGrade; }
    public String getTargetGradesJson() { return targetGradesJson; }
    public void setTargetGradesJson(String targetGradesJson) { this.targetGradesJson = targetGradesJson; }
    public Boolean getIsAllGrades() { return isAllGrades; }
    public void setIsAllGrades(Boolean isAllGrades) { this.isAllGrades = isAllGrades; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }
    public Long getScopeId() { return scopeId; }
    public void setScopeId(Long scopeId) { this.scopeId = scopeId; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getUniversityId() { return universityId; }
    public void setUniversityId(String universityId) { this.universityId = universityId; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
