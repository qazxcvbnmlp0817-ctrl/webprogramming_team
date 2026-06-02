package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "CURRICULUM_ITEMS")
public class CurriculumItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String year;
    private String semester;
    private String category;
    private boolean required;
    private int credits;

    @Column(nullable = false)
    private Long deptId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }
    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }
    public Long getDeptId() { return deptId; }
    public void setDeptId(Long deptId) { this.deptId = deptId; }
}
