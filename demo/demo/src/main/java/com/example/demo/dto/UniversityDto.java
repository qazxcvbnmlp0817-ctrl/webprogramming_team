package com.example.demo.dto;

import java.util.List;

public class UniversityDto {
    private Long id;
    private String name;
    private String description;
    private List<SchoolDto> schools;

    public UniversityDto(Long id, String name, String description, List<SchoolDto> schools) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.schools = schools;
    }

    public Long getId()               { return id; }
    public String getName()           { return name; }
    public String getDescription()    { return description; }
    public List<SchoolDto> getSchools() { return schools; }

    public int getTotalDeptCount() {
        return schools.stream()
                .flatMap(s -> s.getFaculties().stream())
                .mapToInt(f -> f.getDepts().size())
                .sum();
    }
}
