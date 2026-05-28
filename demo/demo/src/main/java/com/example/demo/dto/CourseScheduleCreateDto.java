package com.example.demo.dto;

public class CourseScheduleCreateDto {
    private Long courseId;
    private String courseName;
    private String title;
    private String eventDate; // yyyy-MM-dd
    private String category;  // 시험, 과제, 기타

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
