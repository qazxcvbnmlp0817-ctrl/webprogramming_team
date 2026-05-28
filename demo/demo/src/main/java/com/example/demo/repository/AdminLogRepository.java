package com.example.demo.repository;

import com.example.demo.entity.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {
    List<AdminLog> findTop50ByUniversityIdOrderByCreatedAtDesc(Long universityId);
}
