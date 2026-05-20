package com.example.demo.repository;

import com.example.demo.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByScopeTypeAndScopeIdOrderByCreatedDateDesc(String scopeType, Long scopeId);
}
