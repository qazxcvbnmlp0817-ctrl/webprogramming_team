package com.example.demo.dto;

import com.example.demo.entity.LectureOffering;

public class LectureOfferingDto {
    private Long id;
    private String semester;
    private String departmentName;
    private String targetYear;
    private String completionType;
    private String areaType;
    private String courseCode;
    private String courseName;
    private String section;
    private int credits;
    private int theoryHours;
    private int designHours;
    private int practiceHours;
    private int totalHours;
    private int enrolled;
    private int capacity;
    private String professorName;
    private String lectureTime;

    public static LectureOfferingDto from(LectureOffering offering) {
        LectureOfferingDto dto = new LectureOfferingDto();
        dto.id = offering.getId();
        dto.semester = offering.getSemester();
        dto.departmentName = offering.getDepartmentName();
        dto.targetYear = offering.getTargetYear();
        dto.completionType = offering.getCompletionType();
        dto.areaType = offering.getAreaType();
        dto.courseCode = offering.getCourseCode();
        dto.courseName = offering.getCourseName();
        dto.section = offering.getSection();
        dto.credits = offering.getCredits();
        dto.theoryHours = offering.getTheoryHours();
        dto.designHours = offering.getDesignHours();
        dto.practiceHours = offering.getPracticeHours();
        dto.totalHours = offering.getTotalHours();
        dto.enrolled = offering.getEnrolled();
        dto.capacity = offering.getCapacity();
        dto.professorName = offering.getProfessorName();
        dto.lectureTime = offering.getLectureTime();
        return dto;
    }

    public Long getId() { return id; }
    public String getSemester() { return semester; }
    public String getDepartmentName() { return departmentName; }
    public String getTargetYear() { return targetYear; }
    public String getCompletionType() { return completionType; }
    public String getAreaType() { return areaType; }
    public String getCourseCode() { return courseCode; }
    public String getCourseName() { return courseName; }
    public String getSection() { return section; }
    public int getCredits() { return credits; }
    public int getTheoryHours() { return theoryHours; }
    public int getDesignHours() { return designHours; }
    public int getPracticeHours() { return practiceHours; }
    public int getTotalHours() { return totalHours; }
    public int getEnrolled() { return enrolled; }
    public int getCapacity() { return capacity; }
    public String getProfessorName() { return professorName; }
    public String getLectureTime() { return lectureTime; }
}
