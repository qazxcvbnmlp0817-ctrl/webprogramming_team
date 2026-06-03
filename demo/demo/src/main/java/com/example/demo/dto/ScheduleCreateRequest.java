package com.example.demo.dto;

public class ScheduleCreateRequest {

    private String title;
    private String content;
    private String scheduleType; // PERSONAL|COURSE|GRADE_NOTICE|DEPT_NOTICE|GLOBAL_NOTICE
    private Long courseId;
    private Long departmentId;
    private Integer targetGrade;              // 단일 학년 (하위 호환)
    private java.util.List<Integer> targetGrades; // 다중 학년 선택
    private Boolean isAllGrades;
    private String category;
    private String startDate;
    private String endDate;
    private String startTime;
    private String endTime;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getScheduleType() { return scheduleType; }
    public void setScheduleType(String scheduleType) { this.scheduleType = scheduleType; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Integer getTargetGrade() { return targetGrade; }
    public void setTargetGrade(Integer targetGrade) { this.targetGrade = targetGrade; }
    public java.util.List<Integer> getTargetGrades() { return targetGrades; }
    public void setTargetGrades(java.util.List<Integer> targetGrades) { this.targetGrades = targetGrades; }
    public Boolean getIsAllGrades() { return isAllGrades; }
    public void setIsAllGrades(Boolean isAllGrades) { this.isAllGrades = isAllGrades; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
}
