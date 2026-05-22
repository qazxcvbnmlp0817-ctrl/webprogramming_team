package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

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

    // Super admin: pending admin signups across all schools
    List<User> findByStatusAndMemberType(String status, String memberType);

    // Monthly stats: signup count in a university within a date range
    long countByUniversityIdAndCreatedDateBetween(String universityId,
                                                   LocalDateTime start,
                                                   LocalDateTime end);
}
