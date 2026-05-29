package com.example.demo.dto;

import java.util.List;

public class FacultyDto {
    private Long id;
    private String name;
    private Long schoolId;
    private List<DeptSelectionDto> depts;

    public FacultyDto(Long id, String name, Long schoolId, List<DeptSelectionDto> depts) {
        this.id = id;
        this.name = name;
        this.schoolId = schoolId;
        this.depts = depts;
    }

    public Long getId()                      { return id; }
    public String getName()                  { return name; }
    public Long getSchoolId()                { return schoolId; }
    public List<DeptSelectionDto> getDepts() { return depts; }
}
