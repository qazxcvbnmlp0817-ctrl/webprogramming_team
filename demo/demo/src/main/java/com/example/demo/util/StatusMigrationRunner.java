package com.example.demo.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(3)
public class StatusMigrationRunner implements CommandLineRunner {

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            // Oracle stores boolean as NUMBER(1): 1 = approved, 0 = not approved
            em.createNativeQuery(
                "UPDATE APP_USERS SET STATUS = 'ACTIVE' WHERE APPROVED = 1 AND STATUS IS NULL"
            ).executeUpdate();
            em.createNativeQuery(
                "UPDATE APP_USERS SET STATUS = 'PENDING_APPROVAL' WHERE APPROVED = 0 AND STATUS IS NULL"
            ).executeUpdate();
            // Default fallback for rows where APPROVED column doesn't exist or is null
            em.createNativeQuery(
                "UPDATE APP_USERS SET STATUS = 'ACTIVE' WHERE STATUS IS NULL"
            ).executeUpdate();
        } catch (Exception e) {
            // APPROVED column may not exist if schema is fresh; log and continue
            System.out.println("[StatusMigrationRunner] Status backfill skipped: " + e.getMessage());
        }

        // The APPROVED column is no longer on the entity, so JPA INSERTs omit it.
        // Oracle's original NOT NULL constraint must be relaxed so new signups succeed.
        //
        // Wrapped in a PL/SQL block that swallows ORA-01451 (column already nullable)
        // and ORA-00904 (column does not exist on fresh schemas). Catching the
        // exception in Java is not enough — Hibernate marks the surrounding
        // @Transactional rollback-only when the SQL fails, causing the method
        // to fail at commit. Handling the error inside Oracle prevents that.
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
