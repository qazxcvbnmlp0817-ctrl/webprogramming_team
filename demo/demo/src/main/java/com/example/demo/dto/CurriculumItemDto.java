package com.example.demo.dto;

public class CurriculumItemDto {
    private final String name;
    private final String year;
    private final boolean required;
    private final int credit;

    public CurriculumItemDto(String name, String year, boolean required, int credit) {
        this.name = name;
        this.year = year;
        this.required = required;
        this.credit = credit;
    }

    public String getName()     { return name; }
    public String getYear()     { return year; }
    public boolean isRequired() { return required; }
    public int getCredit()      { return credit; }
}
