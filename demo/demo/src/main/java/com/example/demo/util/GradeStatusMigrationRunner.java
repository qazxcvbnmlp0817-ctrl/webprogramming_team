package com.example.demo.util;

import com.example.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(5)
public class GradeStatusMigrationRunner implements CommandLineRunner {

    private final UserRepository userRepository;

    public GradeStatusMigrationRunner(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        try {
            int updated = userRepository.clearNonStudentGradeAndStatus();
            if (updated > 0) {
                System.out.println("[GradeStatusMigrationRunner] 비학생 계정 " + updated
                        + "건의 grade/enrollmentStatus를 null로 정리 완료");
            }
        } catch (Exception e) {
            System.out.println("[GradeStatusMigrationRunner] skipped: " + e.getMessage());
        }
    }
}
