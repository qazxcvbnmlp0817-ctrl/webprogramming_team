package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Spring Boot 전체 컨텍스트 로드 테스트
 * 주의: application.properties의 spring.autoconfigure.exclude를 제거하여 DB를 활성화하면
 *       이 테스트를 실행하기 위해 Oracle DB 연결 정보가 필요합니다.
 *       DB 연동 후 CI/CD 환경에 application-secret.properties 설정 필요.
 */
@SpringBootTest
class DemoApplicationTests {

	@Test
	void contextLoads() {
	}

}
