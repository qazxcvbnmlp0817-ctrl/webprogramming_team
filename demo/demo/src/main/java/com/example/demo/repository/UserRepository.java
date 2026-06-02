package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByNameAndPhone(String name, String phone);
    List<User> findByMemberType(String memberType);
    boolean existsByUsername(String username);

    List<User> findByAdminRoleIsNotNull();
    List<User> findByUniversityIdAndAdminRoleIsNotNull(String universityId);
    long countByCreatedDateAfter(LocalDateTime date);

    // School admin: all users in a university
    List<User> findByUniversityId(String universityId);

    // Dept/Faculty admin: users in a specific department (matched by name)
    List<User> findByUniversityIdAndDepartment(String universityId, String department);

    // School admin: pending-approval users in a university
    List<User> findByUniversityIdAndStatus(String universityId, String status);

    // School admin: pending-approval list excluding a memberType (used to hide
    // admin-role applications from school admins — those are handled by SUPER_ADMIN).
    List<User> findByUniversityIdAndStatusAndMemberTypeNot(String universityId,
                                                            String status,
                                                            String memberType);

    // Dept/Faculty admin: pending users filtered by department name
    List<User> findByUniversityIdAndDepartmentAndStatus(String universityId,
                                                         String department,
                                                         String status);

    // Super admin: pending admin signups across all schools
    List<User> findByStatusAndMemberType(String status, String memberType);

    // Monthly stats: signup count in a university within a date range
    long countByUniversityIdAndCreatedDateBetween(String universityId,
                                                   LocalDateTime start,
                                                   LocalDateTime end);

    // Professor account: find login account linked to a Professor entity
    Optional<User> findByProfessorEntityId(Long professorEntityId);

    // Professor accounts by university
    List<User> findByMemberTypeAndUniversityId(String memberType, String universityId);

    // Find ID: lookup by name alone (admin)
    Optional<User> findByName(String name);

    // Find ID / Find PW: lookup by name + studentId
    Optional<User> findByNameAndStudentId(String name, String studentId);

    // Find ID / Find PW: lookup by name + studentId + college + universityId
    Optional<User> findByNameAndStudentIdAndCollegeAndUniversityId(
            String name, String studentId, String college, String universityId);

    // Find PW: lookup by username + name + studentId + college + universityId
    Optional<User> findByUsernameAndNameAndStudentIdAndCollegeAndUniversityId(
            String username, String name, String studentId, String college, String universityId);

    // Find PW: admin lookup by username + name
    Optional<User> findByUsernameAndName(String username, String name);

    // Find ID: lookup by name + studentId + department (학과 기준)
    Optional<User> findByNameAndStudentIdAndDepartment(
            String name, String studentId, String department);

    // Find PW (개선): username + name + studentId + department (학과 기준)
    Optional<User> findByUsernameAndNameAndStudentIdAndDepartment(
            String username, String name, String studentId, String department);

    // Find PW (대학 없이): username + name + studentId
    Optional<User> findByUsernameAndNameAndStudentId(
            String username, String name, String studentId);

    // 학번/교번 중복 확인 (같은 대학 내 동일 회원 유형 중복 방지)
    boolean existsByStudentIdAndUniversityId(String studentId, String universityId);
    boolean existsByStudentIdAndUniversityIdAndMemberType(String studentId, String universityId, String memberType);

    // 마이그레이션: 비학생 계정의 grade·enrollmentStatus를 null로 정리
    @Modifying
    @Query("UPDATE User u SET u.grade = null, u.enrollmentStatus = null " +
           "WHERE u.memberType <> 'student' AND (u.grade IS NOT NULL OR u.enrollmentStatus IS NOT NULL)")
    int clearNonStudentGradeAndStatus();
}
