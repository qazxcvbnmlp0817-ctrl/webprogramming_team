package com.example.demo.repository;

import com.example.demo.entity.CurriculumItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CurriculumItemRepository extends JpaRepository<CurriculumItem, Long> {
    List<CurriculumItem> findByDeptId(Long deptId);
    List<CurriculumItem> findByDeptIdIn(List<Long> deptIds);
    void deleteByDeptId(Long deptId);
}
