package com.example.demo.repository;

import com.example.demo.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    // 개인 일정 (본인만)
    List<Schedule> findByOwnerIdAndScheduleType(Long ownerId, String scheduleType);

    // 과목 일정 (courseId 목록)
    List<Schedule> findByCourseIdInAndScheduleType(List<Long> courseIds, String scheduleType);

    // 학년 공지
    List<Schedule> findByScheduleTypeAndTargetGrade(String scheduleType, Integer targetGrade);

    // 학과 공지
    List<Schedule> findByScheduleTypeAndDepartmentId(String scheduleType, Long departmentId);

    // 전체 공지
    List<Schedule> findByScheduleType(String scheduleType);

    // 완료 상태 토글용
    Optional<Schedule> findByIdAndOwnerId(Long id, Long ownerId);

    // 학과 삭제 시 연관 일정 제거용
    List<Schedule> findByDepartmentId(Long departmentId);
    void deleteByDepartmentId(Long departmentId);

    // 대학별 SCHOOL_NOTICE 일정 (단일 타입용)
    List<Schedule> findByScheduleTypeAndUniversityId(String scheduleType, String universityId);

    // 다중 scheduleType 조회 (하위 호환용)
    List<Schedule> findByScheduleTypeInAndDepartmentId(List<String> scheduleTypes, Long departmentId);
    List<Schedule> findByScheduleTypeIn(List<String> scheduleTypes);
    List<Schedule> findByCourseIdInAndScheduleTypeIn(List<Long> courseIds, List<String> scheduleTypes);
}
