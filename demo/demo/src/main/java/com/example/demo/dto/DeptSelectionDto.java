package com.example.demo.dto;

public class DeptSelectionDto {
    private Long id;
    private String name;
    private Long facultyId;

    public DeptSelectionDto(Long id, String name, Long facultyId) {
        this.id = id;
        this.name = name;
        this.facultyId = facultyId;
    }

    public Long getId()      { return id; }
    public String getName()  { return name; }
    public Long getFacultyId() { return facultyId; }
}
