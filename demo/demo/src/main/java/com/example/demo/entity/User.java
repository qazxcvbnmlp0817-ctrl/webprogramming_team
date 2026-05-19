package com.example.demo.entity;

// ===== DB 연동 시 아래 주석 해제 =====
// import jakarta.persistence.*;

public class User {

    // @Id
    // @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @Column(unique = true, nullable = false)
    private String username;

    // @Column(nullable = false)
    private String password; // DB 연동 시 BCrypt 암호화 적용

    // @Column(nullable = false)
    private String name;

    // @Column(nullable = false)
    private String memberType; // student, professor, admin

    private String universityId;
    private String college;
    private String department;
    private String studentId;
    private String phone;

    // @Column(nullable = false)
    private boolean approved; // 관리자 승인 여부 (admin 은 false 로 시작)

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
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
}
