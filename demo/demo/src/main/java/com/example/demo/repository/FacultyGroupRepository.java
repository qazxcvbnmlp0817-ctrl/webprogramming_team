package com.example.demo.repository;

import com.example.demo.entity.FacultyGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacultyGroupRepository extends JpaRepository<FacultyGroup, Long> {
    List<FacultyGroup> findBySchoolIdOrderByIdAsc(Long schoolId);
}
