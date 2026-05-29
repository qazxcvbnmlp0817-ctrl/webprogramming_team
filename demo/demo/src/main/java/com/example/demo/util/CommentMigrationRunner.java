package com.example.demo.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(4)
public class CommentMigrationRunner implements CommandLineRunner {

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            em.createNativeQuery(
                "UPDATE COMMENTS SET AUTHOR_USERNAME = AUTHOR WHERE AUTHOR_USERNAME IS NULL"
            ).executeUpdate();
        } catch (Exception e) {
            System.out.println("[CommentMigrationRunner] skipped: " + e.getMessage());
        }
    }
}
