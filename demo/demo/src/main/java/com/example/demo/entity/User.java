package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "APP_USERS")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String memberType; // student, professor, admin

    private String universityId;
    private String college;
    private String department;
    private String studentId;
    private String phone;
    private Integer grade;

    // status: ACTIVE | PENDING_APPROVAL | SUSPENDED | DELETED
    // Nullable at DDL level so Hibernate can add the column to existing Oracle
    // tables that already have rows; StatusMigrationRunner backfills based on APPROVED.
    @Column
    private String status = "ACTIVE";

    private String adminRole; // SUPER_ADMIN | SCHOOL_ADMIN | DEPT_ADMIN | null

    private Long professorEntityId; // 교수 계정 전용: PROFESSORS 테이블 FK

    private String enrollmentStatus; // freshman, enrolled, graduated

    @Column(nullable = true)
    private Boolean notiNotice  = true;
    @Column(nullable = true)
    private Boolean notiComment = true;
    @Column(nullable = true)
    private Boolean notiDday    = true;

    private java.time.LocalDateTime createdDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMemberType() { return memberType; }
    public void setMemberType(String memberType) { this.memberType = memberType; }
    public String getUniversityId() { return universityId; }
    public void setUniversityId(String universityId) { this.universityId = universityId; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminRole() { return adminRole; }
    public void setAdminRole(String adminRole) { this.adminRole = adminRole; }
    public Long getProfessorEntityId() { return professorEntityId; }
    public void setProfessorEntityId(Long professorEntityId) { this.professorEntityId = professorEntityId; }
    public String getEnrollmentStatus() { return enrollmentStatus; }
    public void setEnrollmentStatus(String enrollmentStatus) { this.enrollmentStatus = enrollmentStatus; }
    public Boolean getNotiNotice()  { return notiNotice; }
    public void setNotiNotice(Boolean notiNotice)   { this.notiNotice  = notiNotice; }
    public Boolean getNotiComment() { return notiComment; }
    public void setNotiComment(Boolean notiComment) { this.notiComment = notiComment; }
    public Boolean getNotiDday()    { return notiDday; }
    public void setNotiDday(Boolean notiDday)       { this.notiDday    = notiDday; }
    public java.time.LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(java.time.LocalDateTime createdDate) { this.createdDate = createdDate; }
}
