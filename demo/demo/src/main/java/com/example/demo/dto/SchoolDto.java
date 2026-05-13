package com.example.demo.dto;

import java.util.List;

public class SchoolDto {
    private Long id;
    private String name;
    private String description;
    private List<FacultyDto> faculties;

    public SchoolDto(Long id, String name, String description, List<FacultyDto> faculties) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.faculties = faculties;
    }

    public Long getId()                   { return id; }
    public String getName()               { return name; }
    public String getDescription()        { return description; }
    public List<FacultyDto> getFaculties() { return faculties; }

    public int getTotalDeptCount() {
        return faculties.stream().mapToInt(f -> f.getDepts().size()).sum();
    }
}
