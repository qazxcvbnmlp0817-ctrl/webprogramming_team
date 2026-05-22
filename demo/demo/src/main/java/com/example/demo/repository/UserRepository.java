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

    // School admin: pending-approval users in a university
    List<User> findByUniversityIdAndStatus(String universityId, String status);

    // Monthly stats: signup count in a university within a date range
    long countByUniversityIdAndCreatedDateBetween(String universityId,
                                                   LocalDateTime start,
                                                   LocalDateTime end);
}
