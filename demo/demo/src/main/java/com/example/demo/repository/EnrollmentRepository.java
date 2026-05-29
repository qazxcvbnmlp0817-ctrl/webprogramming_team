package com.example.demo.repository;

import com.example.demo.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByStudentUsernameAndSemester(String studentUsername, String semester);

    List<Enrollment> findByStudentUsername(String studentUsername);

    List<Enrollment> findByCourseIdAndSemester(Long courseId, String semester);

    boolean existsByStudentUsernameAndCourseIdAndSemester(String studentUsername, Long courseId, String semester);

    long countByStudentUsernameAndSemester(String studentUsername, String semester);

    List<Enrollment> findByDeptId(Long deptId);

    void deleteByDeptId(Long deptId);
}
