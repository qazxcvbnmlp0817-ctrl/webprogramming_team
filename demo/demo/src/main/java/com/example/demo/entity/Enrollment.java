package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// 학생-강좌 수강신청 관계
@Entity
@Table(name = "ENROLLMENTS",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_username", "course_id", "semester"}))
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_username", nullable = false, length = 100)
    private String studentUsername;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "dept_id", nullable = false)
    private Long deptId;

    @Column(nullable = false, length = 20)
    private String semester;

    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getStudentUsername() { return studentUsername; }
    public void setStudentUsername(String studentUsername) { this.studentUsername = studentUsername; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public Long getDeptId() { return deptId; }
    public void setDeptId(Long deptId) { this.deptId = deptId; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }
}
