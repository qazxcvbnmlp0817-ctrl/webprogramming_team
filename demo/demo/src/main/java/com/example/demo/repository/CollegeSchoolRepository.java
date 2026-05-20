package com.example.demo.repository;

import com.example.demo.entity.CollegeSchool;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollegeSchoolRepository extends JpaRepository<CollegeSchool, Long> {
    List<CollegeSchool> findByUniversityIdOrderByIdAsc(Long universityId);
}
