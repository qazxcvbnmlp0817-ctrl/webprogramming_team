package com.example.demo.dto;

import java.util.List;

public class DepartmentDetailDto {
    private final Long id;
    private final String name;
    private final String description;
    private final List<ProfessorDto> professors;
    private final List<CurriculumItemDto> curriculum;
    private final String address;
    private final String phone;
    private final String email;
    private final String hours;

    public DepartmentDetailDto(Long id, String name, String description,
                               List<ProfessorDto> professors,
                               List<CurriculumItemDto> curriculum,
                               String address, String phone,
                               String email, String hours) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.professors = professors;
        this.curriculum = curriculum;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.hours = hours;
    }

    public Long getId()                            { return id; }
    public String getName()                        { return name; }
    public String getDescription()                 { return description; }
    public List<ProfessorDto> getProfessors()      { return professors; }
    public List<CurriculumItemDto> getCurriculum() { return curriculum; }
    public String getAddress()                     { return address; }
    public String getPhone()                       { return phone; }
    public String getEmail()                       { return email; }
    public String getHours()                       { return hours; }
}
