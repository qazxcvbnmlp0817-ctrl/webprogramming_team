package com.example.demo.util;

import com.example.demo.entity.User;
import com.example.demo.repository.UniversityRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminUserInitializer(UserRepository userRepository,
                                 UniversityRepository universityRepository) {
        this.userRepository = userRepository;
        this.universityRepository = universityRepository;
    }

    @Override
    public void run(String... args) {
        String firstUnivId = universityRepository.findAll().stream()
                .findFirst()
                .map(u -> String.valueOf(u.getId()))
                .orElse("1");

        createIfAbsent("superadmin", "admin1234", "최고관리자", "SUPER_ADMIN", null, null);
        createIfAbsent("schooladmin", "admin1234", "학교관리자", "SCHOOL_ADMIN", firstUnivId, null);
        createIfAbsent("deptadmin", "admin1234", "학과관리자", "DEPT_ADMIN", firstUnivId, "컴퓨터공학과");

        // Fix existing accounts that are missing universityId
        patchUniversityId("schooladmin", firstUnivId);
        patchUniversityId("deptadmin", firstUnivId);
    }

    private void createIfAbsent(String username, String password, String name,
                                  String adminRole, String universityId, String department) {
        if (userRepository.existsByUsername(username)) return;
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setMemberType("admin");
        user.setApproved(true);
        user.setAdminRole(adminRole);
        user.setUniversityId(universityId);
        user.setDepartment(department);
        userRepository.save(user);
    }

    private void patchUniversityId(String username, String universityId) {
        userRepository.findByUsername(username).ifPresent(user -> {
            if (user.getUniversityId() == null || user.getUniversityId().isBlank()) {
                user.setUniversityId(universityId);
                userRepository.save(user);
            }
        });
    }
}
