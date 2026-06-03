package com.example.demo.repository;

import com.example.demo.entity.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    List<Professor> findByDeptId(Long deptId);
    List<Professor> findByDeptIdIn(List<Long> deptIds);
    List<Professor> findByName(String name);
    Optional<Professor> findByNameAndDeptId(String name, Long deptId);
}
