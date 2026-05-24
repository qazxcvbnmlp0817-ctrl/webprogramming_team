package com.example.demo.dto;

import java.util.List;

public class SchoolTreeDto {

    private String name;
    private String description;
    private List<CollegeDto> colleges;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<CollegeDto> getColleges() { return colleges; }
    public void setColleges(List<CollegeDto> colleges) { this.colleges = colleges; }

    public static class CollegeDto {
        private Long id;
        private String name;
        private String description;
        private List<FacultyDto> faculties;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<FacultyDto> getFaculties() { return faculties; }
        public void setFaculties(List<FacultyDto> faculties) { this.faculties = faculties; }
    }

    public static class FacultyDto {
        private Long id;
        private String name;
        private List<DeptDto> departments;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<DeptDto> getDepartments() { return departments; }
        public void setDepartments(List<DeptDto> departments) { this.departments = departments; }
    }

    public static class DeptDto {
        private Long id;
        private String name;
        private String description;
        private String phone;
        private String email;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}
