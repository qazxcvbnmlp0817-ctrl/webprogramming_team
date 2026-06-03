package com.example.demo.dto;

public class CurriculumItemDto {
    private final Long id;
    private final String name;
    private final String year;
    private final String semester;
    private final String category;
    private final boolean required;
    private final int credit;

    public CurriculumItemDto(String name, String year, boolean required, int credit) {
        this(null, name, year, null, null, required, credit);
    }

    public CurriculumItemDto(String name, String year, String semester, String category, boolean required, int credit) {
        this(null, name, year, semester, category, required, credit);
    }

    public CurriculumItemDto(Long id, String name, String year, String semester, String category, boolean required, int credit) {
        this.id = id;
        this.name = name;
        this.year = year;
        this.semester = semester;
        this.category = category;
        this.required = required;
        this.credit = credit;
    }

    public Long getId()       { return id; }
    public String getName()     { return name; }
    public String getYear()     { return year; }
    public String getSemester() { return semester; }
    public String getCategory() { return category; }
    public boolean isRequired() { return required; }
    public int getCredit()      { return credit; }
}
