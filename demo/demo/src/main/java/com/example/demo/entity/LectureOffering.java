package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "LECTURE_OFFERINGS")
public class LectureOffering {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String semester;

    @Column(nullable = false)
    private String departmentName;

    private String targetYear;
    private String completionType;
    private String areaType;

    @Column(nullable = false, length = 30)
    private String courseCode;

    @Column(nullable = false)
    private String courseName;

    @Column(nullable = false, length = 10)
    private String section;

    private int credits;
    private int theoryHours;
    private int designHours;
    private int practiceHours;
    private int totalHours;
    private int enrolled;
    private int capacity;

    private String professorName;

    @Column(nullable = false)
    private String lectureTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getTargetYear() { return targetYear; }
    public void setTargetYear(String targetYear) { this.targetYear = targetYear; }
    public String getCompletionType() { return completionType; }
    public void setCompletionType(String completionType) { this.completionType = completionType; }
    public String getAreaType() { return areaType; }
    public void setAreaType(String areaType) { this.areaType = areaType; }
    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }
    public int getTheoryHours() { return theoryHours; }
    public void setTheoryHours(int theoryHours) { this.theoryHours = theoryHours; }
    public int getDesignHours() { return designHours; }
    public void setDesignHours(int designHours) { this.designHours = designHours; }
    public int getPracticeHours() { return practiceHours; }
    public void setPracticeHours(int practiceHours) { this.practiceHours = practiceHours; }
    public int getTotalHours() { return totalHours; }
    public void setTotalHours(int totalHours) { this.totalHours = totalHours; }
    public int getEnrolled() { return enrolled; }
    public void setEnrolled(int enrolled) { this.enrolled = enrolled; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public String getProfessorName() { return professorName; }
    public void setProfessorName(String professorName) { this.professorName = professorName; }
    public String getLectureTime() { return lectureTime; }
    public void setLectureTime(String lectureTime) { this.lectureTime = lectureTime; }
}
