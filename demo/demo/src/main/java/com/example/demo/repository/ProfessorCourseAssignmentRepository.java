package com.example.demo.repository;

import com.example.demo.entity.ProfessorCourseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfessorCourseAssignmentRepository extends JpaRepository<ProfessorCourseAssignment, Long> {
    List<ProfessorCourseAssignment> findByDeptId(Long deptId);
    List<ProfessorCourseAssignment> findByDeptIdIn(List<Long> deptIds);
    boolean existsByProfessorIdAndCourseId(Long professorId, Long courseId);
}
