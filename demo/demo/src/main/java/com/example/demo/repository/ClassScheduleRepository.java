package com.example.demo.repository;

import com.example.demo.entity.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {

    List<ClassSchedule> findByProfessorId(Long professorId);

    List<ClassSchedule> findByProfessorIdAndSemester(Long professorId, String semester);

    List<ClassSchedule> findByProfessorIdAndSemesterAndDayOfWeek(Long professorId, String semester, String dayOfWeek);

    // 수강신청한 강좌 목록으로 학생 시간표 조회 (핵심 sync 쿼리)
    List<ClassSchedule> findByCourseIdInAndSemester(List<Long> courseIds, String semester);

    List<ClassSchedule> findByDeptIdAndSemester(Long deptId, String semester);

    List<ClassSchedule> findByDeptIdInAndSemester(List<Long> deptIds, String semester);

    List<ClassSchedule> findBySemester(String semester);

    List<ClassSchedule> findByDeptId(Long deptId);

    void deleteByDeptId(Long deptId);

    void deleteByProfessorId(Long professorId);
}
