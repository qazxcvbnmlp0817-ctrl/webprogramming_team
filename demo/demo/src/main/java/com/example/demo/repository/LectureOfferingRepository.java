package com.example.demo.repository;

import com.example.demo.entity.LectureOffering;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LectureOfferingRepository extends JpaRepository<LectureOffering, Long> {
    List<LectureOffering> findBySemesterOrderByCourseCodeAscSectionAsc(String semester);
    List<LectureOffering> findBySemesterAndDepartmentNameContainingOrderByCourseCodeAscSectionAsc(String semester, String departmentName);
    Optional<LectureOffering> findBySemesterAndCourseCodeAndSection(String semester, String courseCode, String section);
}
