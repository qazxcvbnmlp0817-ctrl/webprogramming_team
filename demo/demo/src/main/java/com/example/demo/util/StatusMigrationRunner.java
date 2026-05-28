package com.example.demo.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class StatusMigrationRunner implements CommandLineRunner {

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public void run(String... args) {
        // All queries use PL/SQL blocks so Oracle swallows ORA-00904 (missing APPROVED column)
        // before Hibernate can mark the transaction rollback-only.
        try {
            em.createNativeQuery(
                "BEGIN EXECUTE IMMEDIATE " +
                "  'UPDATE APP_USERS SET STATUS = ''ACTIVE'' WHERE APPROVED = 1 AND STATUS IS NULL'; " +
                "EXCEPTION WHEN OTHERS THEN IF SQLCODE != -904 THEN RAISE; END IF; END;"
            ).executeUpdate();
            em.createNativeQuery(
                "BEGIN EXECUTE IMMEDIATE " +
                "  'UPDATE APP_USERS SET STATUS = ''PENDING_APPROVAL'' WHERE APPROVED = 0 AND STATUS IS NULL'; " +
                "EXCEPTION WHEN OTHERS THEN IF SQLCODE != -904 THEN RAISE; END IF; END;"
            ).executeUpdate();
            em.createNativeQuery(
                "UPDATE APP_USERS SET STATUS = 'ACTIVE' WHERE STATUS IS NULL"
            ).executeUpdate();
        } catch (Exception e) {
            System.out.println("[StatusMigrationRunner] Status backfill skipped: " + e.getMessage());
        }

        try {
            em.createNativeQuery(
                "BEGIN " +
                "  EXECUTE IMMEDIATE 'ALTER TABLE APP_USERS MODIFY (APPROVED NULL)'; " +
                "EXCEPTION " +
                "  WHEN OTHERS THEN " +
                "    IF SQLCODE != -1451 AND SQLCODE != -904 THEN RAISE; END IF; " +
                "END;"
            ).executeUpdate();
        } catch (Exception e) {
            System.out.println("[StatusMigrationRunner] APPROVED nullable migration skipped: " + e.getMessage());
        }
    }
}
