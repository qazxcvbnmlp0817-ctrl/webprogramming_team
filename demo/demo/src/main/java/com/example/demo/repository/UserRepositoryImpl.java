package com.example.demo.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.example.demo.entity.User;

// ===== DB 연동 시 이 파일 전체 삭제 =====
// JpaRepository 사용 시 자동으로 구현체가 생성되므로 필요 없음

@Repository
public class UserRepositoryImpl implements UserRepository {

    private final List<User> users = new ArrayList<>();
    private Long nextId = 1L;

    @Override
    public Optional<User> findByUsername(String username) {
        return users.stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst();
    }

    @Override
    public Optional<User> findByNameAndPhone(String name, String phone) {
        return users.stream()
                .filter(u -> name.equals(u.getName()) && phone.equals(u.getPhone()))
                .findFirst();
    }

    @Override
    public List<User> findByMemberType(String memberType) {
        return users.stream()
                .filter(u -> u.getMemberType().equals(memberType))
                .collect(Collectors.toList());
    }

    @Override
    public User save(User user) {
        if (user.getId() == null) {
            user.setId(nextId++);
            users.add(user);
        }
        return user;
    }

    @Override
    public boolean existsByUsername(String username) {
        return users.stream().anyMatch(u -> u.getUsername().equals(username));
    }
}
