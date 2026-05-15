package com.example.demo.dto;

public class ProfessorDto {
    private final Long id;
    private final String name;
    private final String specialty;
    private final String email;

    public ProfessorDto(Long id, String name, String specialty, String email) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
        this.email = email;
    }

    public Long getId()          { return id; }
    public String getName()      { return name; }
    public String getSpecialty() { return specialty; }
    public String getEmail()     { return email; }
}
