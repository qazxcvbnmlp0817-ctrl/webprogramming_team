package com.example.demo.dto;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class ScheduleDto {

    private Long id;
    private String title;
    private String content;
    private String scheduleType; // PERSONAL|COURSE|GRADE_NOTICE|DEPT_NOTICE|GLOBAL_NOTICE
    private Long ownerId;
    private Long courseId;
    private String courseName;
    private Long departmentId;
    private Integer targetGrade;
    private String targetGradesJson;
    private Boolean isAllGrades;
    private String category;
    private boolean isCompleted;
    private String startDate;
    private String endDate;
    private String startTime;
    private String endTime;
    private String createdBy;
    private String universityId;
    private Integer dday;

    public ScheduleDto() {}

    public ScheduleDto(Long id, String title, String date, int dday, String category) {
        this.id = id;
        this.title = title;
        this.startDate = date;
        this.dday = dday;
        this.category = category;
    }

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

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Integer getTargetGrade() { return targetGrade; }
    public void setTargetGrade(Integer targetGrade) { this.targetGrade = targetGrade; }
    public String getTargetGradesJson() { return targetGradesJson; }
    public void setTargetGradesJson(String v) { this.targetGradesJson = v; }
    public Boolean getIsAllGrades() { return isAllGrades; }
    public void setIsAllGrades(Boolean v) { this.isAllGrades = v; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) {
        this.startDate = startDate;
        this.dday = calculateDday(startDate);
    }

    public String getDate() { return startDate; }
    public void setDate(String date) { setStartDate(date); }

    public Integer getDday() { return dday; }
    public void setDday(Integer dday) { this.dday = dday; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getUniversityId() { return universityId; }
    public void setUniversityId(String v) { this.universityId = v; }

    private Integer calculateDday(String date) {
        if (date == null || date.isBlank()) return null;
        try {
            return (int) ChronoUnit.DAYS.between(LocalDate.now(), LocalDate.parse(date));
        } catch (RuntimeException ignored) {
            return null;
        }
    }
}
