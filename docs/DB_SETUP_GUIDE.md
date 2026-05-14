# 데이터베이스 연동 가이드

> Oracle AI Database + Spring Data JPA 연동 절차 및 팁

---

## 단계 1 — DB 연결 설정

`db-config-template.txt`를 참고하여 아래 경로에 파일을 직접 생성합니다.
(이 파일은 .gitignore 처리되어 Git에 올라가지 않습니다. 팀원 각자 로컬에서 생성)

```
demo/demo/src/main/resources/application-secret.properties
```

```properties
spring.datasource.url=jdbc:oracle:thin:@//호스트:포트/서비스명
spring.datasource.username=사용자명
spring.datasource.password=비밀번호
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

그 다음 `application.properties`에서 아래 3줄을 제거해야 JPA가 활성화됩니다.

```properties
# 아래 3줄 제거
spring.autoconfigure.exclude=\
  org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
  org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,\
  org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration
```

---

## 단계 2 — Entity 클래스 작성

현재 `dto/` 폴더의 클래스들은 화면 출력용입니다.
DB 테이블과 매핑하려면 별도로 **Entity 클래스**를 `entity/` 폴더에 새로 만듭니다.

```
src/main/java/com/example/demo/
├── dto/         ← 기존 (화면 출력용, 수정 불필요)
├── entity/      ← 새로 생성 (DB 테이블 매핑용)
├── repository/  ← 새로 생성 (DB 조회 인터페이스)
├── service/     ← 새로 생성 (비즈니스 로직)
└── controller/  ← 기존 (더미 데이터 → 서비스 호출로 교체)
```

**Entity 예시 (NoticeEntity.java)**

```java
package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "NOTICE")
public class NoticeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String date;
    private String author;
    private String category;
    private int viewCount;
    private boolean featured;

    // 기본 생성자 (JPA 필수)
    protected NoticeEntity() {}

    // getter
    public Long getId()         { return id; }
    public String getTitle()    { return title; }
    public String getDate()     { return date; }
    public String getAuthor()   { return author; }
    public String getCategory() { return category; }
    public int getViewCount()   { return viewCount; }
    public boolean isFeatured() { return featured; }
}
```

> Entity는 DB 테이블 구조, DTO는 화면 출력 구조입니다. 둘을 분리하는 것이 일반적입니다.

---

## 단계 3 — Repository 인터페이스 작성

Spring Data JPA를 사용하면 SQL을 직접 작성하지 않아도 됩니다.
메서드 이름 규칙만 지키면 쿼리가 자동 생성됩니다.

**예시 (NoticeRepository.java)**

```java
package com.example.demo.repository;

import com.example.demo.entity.NoticeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeRepository extends JpaRepository<NoticeEntity, Long> {

    // 날짜 기준 내림차순 상위 5개
    List<NoticeEntity> findTop5ByOrderByDateDesc();

    // featured=true인 항목 중 최신 1개
    NoticeEntity findTopByFeaturedTrueOrderByDateDesc();

    // 카테고리로 필터링
    List<NoticeEntity> findByCategoryOrderByDateDesc(String category);
}
```

`JpaRepository`를 상속하면 아래가 자동으로 제공됩니다.
- `findAll()` — 전체 조회
- `findById(id)` — 단건 조회
- `save(entity)` — 저장/수정
- `deleteById(id)` — 삭제

---

## 단계 4 — Service 레이어 작성

Controller에서 직접 Repository를 호출하지 않고 Service를 거칩니다.
Service에서 Entity → DTO 변환 작업을 수행합니다.

**예시 (NoticeService.java)**

```java
package com.example.demo.service;

import com.example.demo.dto.NoticeDto;
import com.example.demo.repository.NoticeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoticeService {

    private final NoticeRepository noticeRepository;

    public NoticeService(NoticeRepository noticeRepository) {
        this.noticeRepository = noticeRepository;
    }

    // 최신 공지 5개 (메인 페이지용)
    public List<NoticeDto> getTop5() {
        return noticeRepository.findTop5ByOrderByDateDesc()
                .stream()
                .map(e -> new NoticeDto(
                        e.getId(), e.getTitle(), e.getDate(),
                        e.getAuthor(), e.getCategory(), e.getViewCount(), e.isFeatured()
                ))
                .toList();
    }

    // 대표 공지 1건
    public NoticeDto getFeatured() {
        var e = noticeRepository.findTopByFeaturedTrueOrderByDateDesc();
        return new NoticeDto(
                e.getId(), e.getTitle(), e.getDate(),
                e.getAuthor(), e.getCategory(), e.getViewCount(), e.isFeatured()
        );
    }

    // 전체 목록
    public List<NoticeDto> getAll() {
        return noticeRepository.findAll()
                .stream()
                .map(e -> new NoticeDto(
                        e.getId(), e.getTitle(), e.getDate(),
                        e.getAuthor(), e.getCategory(), e.getViewCount(), e.isFeatured()
                ))
                .toList();
    }
}
```

---

## 단계 5 — Controller에서 더미 데이터 교체

기존 더미 데이터를 Service 호출로 교체합니다.

**NoticeController.java 수정 예시**

```java
@Controller
public class NoticeController {

    private final NoticeService noticeService;  // 추가

    public NoticeController(NoticeService noticeService) {  // 추가
        this.noticeService = noticeService;
    }

    @GetMapping("/notice")
    public String list(Model model) {
        // 기존 더미 데이터 List.of(...) 제거하고 아래로 교체
        model.addAttribute("featured", noticeService.getFeatured());
        model.addAttribute("notices",  noticeService.getAll());
        model.addAttribute("currentPage", "notice");
        return "notice/list";
    }
}
```

---

## 권장 작업 순서

```
1. DB 연결 확인
   → application-secret.properties 작성 후 앱 실행
   → 콘솔에 오류 없이 "Started DemoApplication" 출력되면 성공

2. 테이블 생성
   → Oracle SQL Developer 등으로 직접 CREATE TABLE 실행
   → 또는 ddl-auto=create 임시 설정 후 Entity 작성하면 자동 생성 (개발 환경 한정)

3. Entity 작성 → Repository 작성 → 테이블 매핑 확인
4. Service 작성 → Controller 더미 데이터 교체
5. 테스트 업데이트
```

---

## 팀 분담 팁

각 파일에 `TODO: [팀원-담당명]` 주석이 있어 담당 파트가 명확합니다.
아래 순서로 각자 독립적으로 작업하면 충돌 없이 병렬 진행이 가능합니다.

| 담당 | 작업 파일 |
|------|----------|
| 공지사항 | NoticeEntity → NoticeRepository → NoticeService → NoticeController |
| 게시판 | PostEntity → PostRepository → PostService → BoardController |
| 일정 | ScheduleEntity → ScheduleRepository → ScheduleService → ScheduleController |
| 학과정보 | 정적 HTML 교체 (Entity 불필요) |
| 인증 | UserEntity → Spring Security 설정 → AuthController |

---

## 참고: ddl-auto 옵션 설명

| 값 | 동작 | 사용 시점 |
|----|------|----------|
| `create` | 앱 시작 시 테이블 새로 생성 (기존 데이터 삭제) | 초기 개발 |
| `update` | Entity 변경분만 반영 (기존 데이터 유지) | 개발 중 |
| `validate` | Entity와 DB 스키마 일치 여부만 확인 | 운영 전 검증 |
| `none` | 아무것도 하지 않음 | 운영 환경 |
