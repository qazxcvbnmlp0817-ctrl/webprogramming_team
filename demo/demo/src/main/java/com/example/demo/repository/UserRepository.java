package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import com.example.demo.entity.User;

// ===== DB 연동 시 아래 주석 해제 =====
// import org.springframework.data.jpa.repository.JpaRepository;

// ===== DB 연동 시 이 인터페이스를 아래로 교체 =====
// public interface UserRepository extends JpaRepository<User, Long> {
//     Optional<User> findByUsername(String username);
//     Optional<User> findByNameAndPhone(String name, String phone);
//     List<User> findByMemberType(String memberType);
//     boolean existsByUsername(String username);
// }

public interface UserRepository {
    Optional<User> findByUsername(String username);
    Optional<User> findByNameAndPhone(String name, String phone);
    List<User> findByMemberType(String memberType);
    User save(User user);
    boolean existsByUsername(String username);
}
