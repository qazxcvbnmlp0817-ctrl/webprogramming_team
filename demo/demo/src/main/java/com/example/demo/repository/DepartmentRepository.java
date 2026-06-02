package com.example.demo.repository;

import com.example.demo.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByFacultyIdOrderByIdAsc(Long facultyId);
    List<Department> findByFacultyId(Long facultyId);
}
