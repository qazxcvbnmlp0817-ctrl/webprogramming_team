package com.example.demo.util;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

//@Component
@Order(2)
public class StatusMigrationRunner implements CommandLineRunner {

    @PersistenceContext
    private EntityManager em;

    private final TransactionTemplate txTemplate;

    public StatusMigrationRunner(PlatformTransactionManager txManager) {
        this.txTemplate = new TransactionTemplate(txManager);
        this.txTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @Override
    public void run(String... args) {
        // APPROVED 컬럼이 없는 신규 스키마에서는 이 UPDATE 자체가 불필요하므로
        // 각 쿼리를 독립 트랜잭션으로 실행해 실패해도 전체가 롤백되지 않도록 처리
        runSafely("UPDATE APP_USERS SET STATUS = 'ACTIVE' WHERE APPROVED = 1 AND STATUS IS NULL");
        runSafely("UPDATE APP_USERS SET STATUS = 'PENDING_APPROVAL' WHERE APPROVED = 0 AND STATUS IS NULL");
        runSafely("UPDATE APP_USERS SET STATUS = 'ACTIVE' WHERE STATUS IS NULL");

        // APPROVED 컬럼 nullable 처리 (없는 컬럼이면 Oracle PL/SQL 내부에서 무시)
        runSafely(
            "BEGIN " +
            "  EXECUTE IMMEDIATE 'ALTER TABLE APP_USERS MODIFY (APPROVED NULL)'; " +
            "EXCEPTION " +
            "  WHEN OTHERS THEN " +
            "    IF SQLCODE != -1451 AND SQLCODE != -904 THEN RAISE; END IF; " +
            "END;"
        );
    }

    private void runSafely(String sql) {
        try {
            txTemplate.execute(status -> {
                em.createNativeQuery(sql).executeUpdate();
                return null;
            });
        } catch (Exception e) {
            System.out.println("[StatusMigrationRunner] Skipped: " + e.getMessage());
        }
    }
}
