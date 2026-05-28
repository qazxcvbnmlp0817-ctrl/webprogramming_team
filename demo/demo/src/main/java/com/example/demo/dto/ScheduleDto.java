package com.example.demo.dto;

public class ScheduleDto {

    private final Long id;
    private final String title;
    private final String date;
    private final int dday;
    private final String category;
    private final String courseName; // 과목명 (수업 일정인 경우)

    public ScheduleDto(Long id, String title, String date, int dday, String category) {
        this(id, title, date, dday, category, null);
    }

    public ScheduleDto(Long id, String title, String date, int dday, String category, String courseName) {
        this.id         = id;
        this.title      = title;
        this.date       = date;
        this.dday       = dday;
        this.category   = category;
        this.courseName = courseName;
    }

    public Long getId()         { return id; }
    public String getTitle()    { return title; }
    public String getDate()     { return date; }
    public int getDday()        { return dday; }
    public String getCategory() { return category; }
    public String getCourseName() { return courseName; }
}
