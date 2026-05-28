package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "PROFESSOR_COURSE_ASSIGNMENTS",
    uniqueConstraints = @UniqueConstraint(columnNames = {"professor_id", "course_id"})
)
public class ProfessorCourseAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "professor_id", nullable = false)
    private Long professorId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    // Denormalised for fast scope filtering — set on write, never updated
    @Column(name = "dept_id", nullable = false)
    private Long deptId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProfessorId() { return professorId; }
    public void setProfessorId(Long professorId) { this.professorId = professorId; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public Long getDeptId() { return deptId; }
    public void setDeptId(Long deptId) { this.deptId = deptId; }
}
