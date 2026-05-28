package com.example.demo.dto;

public class FindIdRequestDto {
    private String name;
    private String universityId;
    private String college;
    private String studentId;
    private Integer grade;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUniversityId() { return universityId; }
    public void setUniversityId(String universityId) { this.universityId = universityId; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }
}
