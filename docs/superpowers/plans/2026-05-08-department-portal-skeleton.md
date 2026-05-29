# 학과 정보통합 포털 뼈대 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Spring Boot + Thymeleaf + Bootstrap 5로 학과 정보통합 서비스 뼈대를 구축하여 모든 페이지 라우팅이 동작하고 더미 데이터로 메인 페이지 UI를 확인할 수 있는 환경을 구성한다.

**Architecture:** Thymeleaf 서버사이드 렌더링. `layout/base.html`에 navbar·footer를 fragment로 정의하고 각 페이지가 `th:replace`로 삽입한다. DB 미연동 상태에서도 앱이 기동되도록 DataSource/JPA 자동설정을 비활성화하고, 팀원이 `application-secret.properties`를 추가하면 DB가 활성화되는 구조.

**Tech Stack:** Spring Boot 4.0.6, Java 17, Thymeleaf, Bootstrap 5.3 CDN, Font Awesome 6.5 CDN, Oracle JDBC ojdbc11, Maven

---

## 파일 구조 (생성/수정 대상)

```
webprogramming_team-main/
├── .gitignore                                      [수정] 시크릿 파일 등 제외
├── db-config-template.txt                          [생성] DB 설정 가이드
│
└── demo/demo/
    ├── pom.xml                                     [수정] 의존성 수정
    └── src/
        ├── main/
        │   ├── java/com/example/demo/
        │   │   ├── controller/
        │   │   │   ├── MainController.java         [생성] 메인 페이지, 더미 데이터
        │   │   │   ├── NoticeController.java       [생성] 공지사항 라우팅
        │   │   │   ├── BoardController.java        [생성] 게시판 라우팅
        │   │   │   ├── ScheduleController.java     [생성] 일정 라우팅
        │   │   │   ├── DepartmentController.java   [생성] 학과정보 라우팅
        │   │   │   └── AuthController.java         [생성] 로그인 라우팅
        │   │   └── dto/
        │   │       ├── NoticeDto.java              [생성] 공지사항 더미 데이터 구조
        │   │       ├── PostDto.java                [생성] 게시글 더미 데이터 구조
        │   │       └── ScheduleDto.java            [생성] 일정 더미 데이터 구조
        │   └── resources/
        │       ├── templates/
        │       │   ├── layout/base.html            [생성] navbar·footer fragment
        │       │   ├── main/index.html             [생성] 메인 페이지
        │       │   ├── notice/list.html            [생성] 공지사항 플레이스홀더
        │       │   ├── board/list.html             [생성] 게시판 플레이스홀더
        │       │   ├── schedule/list.html          [생성] 일정 플레이스홀더
        │       │   ├── department/index.html       [생성] 학과정보 플레이스홀더
        │       │   └── auth/login.html             [생성] 로그인 플레이스홀더
        │       ├── static/css/custom.css           [생성] 공통 커스텀 CSS
        │       ├── application.properties          [수정] 앱 설정 + JPA 비활성화
        │       └── application-secret.properties   [생성, gitignored] DB 접속정보
        └── test/java/com/example/demo/
            ├── DemoApplicationTests.java           [유지] 컨텍스트 로드 테스트
            └── controller/
                ├── MainControllerTest.java         [생성]
                ├── NoticeControllerTest.java       [생성]
                ├── BoardControllerTest.java        [생성]
                ├── ScheduleControllerTest.java     [생성]
                ├── DepartmentControllerTest.java   [생성]
                └── AuthControllerTest.java         [생성]
```

---

## Task 1: pom.xml 의존성 수정

**Files:**
- Modify: `demo/demo/pom.xml`

현재 pom.xml에 존재하지 않는 아티팩트 ID가 있어 빌드가 실패한다. 수정한다.

- [x] **Step 1: pom.xml 수정**

`demo/demo/pom.xml` 전체를 아래 내용으로 교체한다.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.0.6</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>dept-portal</name>
    <description>학과 정보통합 서비스 웹 포털</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- 웹 MVC: @Controller, @GetMapping 등 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Thymeleaf: 서버사이드 HTML 템플릿 엔진 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>

        <!-- JPA: 팀원이 DB 연동 시 사용 (현재 비활성화) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Oracle JDBC 드라이버 -->
        <dependency>
            <groupId>com.oracle.database.jdbc</groupId>
            <artifactId>ojdbc11</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- 테스트: JUnit5, MockMvc, AssertJ 포함 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

- [x] **Step 2: 컴파일 확인**

```bash
cd demo/demo && ./mvnw.cmd compile -q
```

예상 출력: `BUILD SUCCESS` (오류 없음)

- [x] **Step 3: 커밋**

```bash
git add demo/demo/pom.xml
git commit -m "fix: pom.xml 의존성 수정 (올바른 스타터 아티팩트로 교체)"
```

---

## Task 2: 설정 파일 구성

**Files:**
- Modify: `demo/demo/src/main/resources/application.properties`
- Create: `demo/demo/src/main/resources/application-secret.properties`
- Create: `.gitignore`
- Create: `db-config-template.txt`

- [x] **Step 1: application.properties 수정**

`demo/demo/src/main/resources/application.properties`를 아래 내용으로 교체한다.

```properties
# 애플리케이션 이름
spring.application.name=dept-portal

# DB 비밀정보는 application-secret.properties에서 관리 (git 제외)
# 해당 파일이 없어도 앱이 시작되도록 optional 설정
spring.config.import=optional:classpath:application-secret.properties

# ===== DB 미설정 시 JPA/DataSource 자동설정 비활성화 =====
# 팀원이 application-secret.properties에 DB 정보를 작성한 후 아래 3줄을 제거하세요
spring.autoconfigure.exclude=\
  org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
  org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,\
  org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration

# 서버 포트 (기본 8080)
server.port=8080

# Thymeleaf 캐시 비활성화 (개발 중 템플릿 수정 즉시 반영)
spring.thymeleaf.cache=false
```

- [x] **Step 2: application-secret.properties 생성**

`demo/demo/src/main/resources/application-secret.properties`를 아래 내용으로 생성한다.
**(이 파일은 .gitignore에 등록되어 git에 올라가지 않는다)**

```properties
# ===================================================
# Oracle AI Database 연결 정보
# 이 파일은 .gitignore 등록 파일입니다 — git에 절대 올리지 마세요!
# ===================================================

# DB 설정 완료 후 application.properties의 spring.autoconfigure.exclude 3줄을 제거하세요
spring.datasource.url=jdbc:oracle:thin:@//호스트:포트/서비스명
spring.datasource.username=사용자명
spring.datasource.password=비밀번호
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# JPA 설정
spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

- [x] **Step 3: .gitignore 생성/수정**

프로젝트 루트(`.gitignore`)를 아래 내용으로 작성한다.

```gitignore
# ===== DB 비밀정보 (절대 git에 올리지 말 것) =====
application-secret.properties

# ===== Java 빌드 산출물 =====
target/
*.class
*.jar
*.war

# ===== IDE 설정 =====
.idea/
*.iml
.vscode/
*.eclipse

# ===== OS 파일 =====
.DS_Store
Thumbs.db

# ===== 브레인스토밍 임시 파일 =====
.superpowers/
```

- [x] **Step 4: db-config-template.txt 생성**

프로젝트 루트에 `db-config-template.txt`를 생성한다. 팀원이 DB 설정 시 참고하는 가이드 파일이다.

```
===================================================
 Oracle AI Database 연결 설정 가이드
===================================================

1. 아래 경로에 파일을 직접 생성하세요 (git에 올라가지 않음):
   demo/demo/src/main/resources/application-secret.properties

2. 아래 내용을 복사하여 본인 환경에 맞게 수정하세요:

   spring.datasource.url=jdbc:oracle:thin:@//호스트:포트/서비스명
   spring.datasource.username=사용자명
   spring.datasource.password=비밀번호
   spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

   spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true

3. application.properties에서 아래 3줄을 제거하세요:
   spring.autoconfigure.exclude=\
     org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
     org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,\
     org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration

4. 앱을 재시작하면 DB가 연동됩니다.

===================================================
 Oracle AI Database 접속 정보 (팀 공유용 별도 채널로 전달)
===================================================
호스트:
포트:
서비스명:
사용자명:
(비밀번호는 별도 채널로 공유)
```

- [x] **Step 5: 커밋**

```bash
git add application.properties .gitignore db-config-template.txt
git commit -m "chore: 앱 설정 파일 구성 및 .gitignore 추가"
```

(application-secret.properties는 .gitignore에 의해 자동 제외됨)

---

## Task 3: DTO 클래스 작성 (TDD)

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/dto/NoticeDto.java`
- Create: `demo/demo/src/main/java/com/example/demo/dto/PostDto.java`
- Create: `demo/demo/src/main/java/com/example/demo/dto/ScheduleDto.java`

DTO는 컨트롤러에서 더미 데이터를 담아 Thymeleaf에 전달하는 단순 데이터 클래스다.
팀원이 실제 DB 연동 시 Entity → DTO 변환 코드만 추가하면 된다.

- [x] **Step 1: NoticeDto 작성**

`demo/demo/src/main/java/com/example/demo/dto/NoticeDto.java`

```java
package com.example.demo.dto;

/**
 * 공지사항 데이터 전송 객체
 * - 연결 템플릿: templates/main/index.html (notices 변수), templates/notice/list.html
 * - 연결 컨트롤러: MainController, NoticeController
 * - TODO: [팀원-공지사항 담당] 실제 DB 연동 시 NoticeEntity → NoticeDto 변환 추가
 */
public class NoticeDto {

    private final Long id;
    private final String title;   // 공지사항 제목
    private final String date;    // 작성 날짜 (yyyy-MM-dd 형식)
    private final String author;  // 작성자

    public NoticeDto(Long id, String title, String date, String author) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.author = author;
    }

    public Long getId()     { return id; }
    public String getTitle()  { return title; }
    public String getDate()   { return date; }
    public String getAuthor() { return author; }
}
```

- [x] **Step 2: PostDto 작성**

`demo/demo/src/main/java/com/example/demo/dto/PostDto.java`

```java
package com.example.demo.dto;

/**
 * 게시글 데이터 전송 객체
 * - 연결 템플릿: templates/main/index.html (posts 변수), templates/board/list.html
 * - 연결 컨트롤러: MainController, BoardController
 * - TODO: [팀원-게시판 담당] 실제 DB 연동 시 PostEntity → PostDto 변환 추가
 */
public class PostDto {

    private final Long id;
    private final String title;   // 게시글 제목
    private final String author;  // 작성자
    private final int likes;      // 좋아요 수 (인기순 정렬 기준)

    public PostDto(Long id, String title, String author, int likes) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.likes = likes;
    }

    public Long getId()     { return id; }
    public String getTitle()  { return title; }
    public String getAuthor() { return author; }
    public int getLikes()     { return likes; }
}
```

- [x] **Step 3: ScheduleDto 작성**

`demo/demo/src/main/java/com/example/demo/dto/ScheduleDto.java`

```java
package com.example.demo.dto;

/**
 * 일정 데이터 전송 객체
 * - 연결 템플릿: templates/main/index.html (schedules 변수), templates/schedule/list.html
 * - 연결 컨트롤러: MainController, ScheduleController
 * - TODO: [팀원-일정 담당] 실제 DB 연동 시 ScheduleEntity → ScheduleDto 변환 추가
 */
public class ScheduleDto {

    private final Long id;
    private final String title;  // 일정 이름
    private final String date;   // 일정 날짜 (yyyy-MM-dd 형식)
    private final int dday;      // D-Day 계산값 (오늘 기준, 0=당일, 음수=지남)

    public ScheduleDto(Long id, String title, String date, int dday) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.dday = dday;
    }

    public Long getId()    { return id; }
    public String getTitle() { return title; }
    public String getDate()  { return date; }
    public int getDday()     { return dday; }
}
```

- [x] **Step 4: 컴파일 확인**

```bash
cd demo/demo && ./mvnw.cmd compile -q
```

예상 출력: `BUILD SUCCESS`

- [x] **Step 5: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/dto/
git commit -m "feat: 공지사항·게시글·일정 DTO 클래스 추가"
```

---

## Task 4: 공통 레이아웃 base.html 작성

**Files:**
- Create: `demo/demo/src/main/resources/templates/layout/base.html`

모든 페이지에서 `th:replace="~{layout/base :: navbar}"` 로 삽입하는 fragment 파일.
네비게이션 바와 푸터를 정의한다.

- [x] **Step 1: layout/base.html 작성**

`demo/demo/src/main/resources/templates/layout/base.html`

```html
<!DOCTYPE html>
<!--
  공통 레이아웃 fragment 파일
  이 파일은 직접 렌더링되지 않습니다.
  사용법:
    네비게이션바 삽입: <div th:replace="~{layout/base :: navbar}"></div>
    푸터 삽입:        <div th:replace="~{layout/base :: footer}"></div>
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head><title>공통 레이아웃 (fragment 전용)</title></head>
<body>

<!-- ========================================
     네비게이션 바 fragment
     각 페이지에서 th:replace로 삽입됩니다.
     currentPage 변수로 활성 메뉴를 하이라이트합니다.
     ======================================== -->
<nav class="navbar navbar-expand-lg sticky-top" th:fragment="navbar" id="mainNav">
    <div class="container">

        <!-- 브랜드 로고: 클릭 시 메인 페이지로 이동 -->
        <a class="navbar-brand fw-bold" th:href="@{/}">
            <i class="fas fa-graduation-cap me-2"></i>학과정보통합서비스
        </a>

        <!-- 모바일 햄버거 버튼 -->
        <button class="navbar-toggler" type="button"
                data-bs-toggle="collapse" data-bs-target="#navMenu"
                aria-controls="navMenu" aria-expanded="false" aria-label="메뉴 열기">
            <span class="navbar-toggler-icon"></span>
        </button>

        <!-- 네비게이션 메뉴 -->
        <div class="collapse navbar-collapse" id="navMenu">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">

                <!-- 공지사항 메뉴: /notice로 이동, 현재 페이지면 active 클래스 추가 -->
                <li class="nav-item">
                    <a class="nav-link"
                       th:href="@{/notice}"
                       th:classappend="${currentPage == 'notice'} ? ' active' : ''">
                        <i class="fas fa-bullhorn me-1"></i>공지사항
                    </a>
                </li>

                <!-- 게시판 메뉴: /board로 이동 -->
                <li class="nav-item">
                    <a class="nav-link"
                       th:href="@{/board}"
                       th:classappend="${currentPage == 'board'} ? ' active' : ''">
                        <i class="fas fa-comments me-1"></i>게시판
                    </a>
                </li>

                <!-- 일정 메뉴: /schedule로 이동 -->
                <li class="nav-item">
                    <a class="nav-link"
                       th:href="@{/schedule}"
                       th:classappend="${currentPage == 'schedule'} ? ' active' : ''">
                        <i class="fas fa-calendar-alt me-1"></i>일정
                    </a>
                </li>

                <!-- 학과정보 메뉴: /department로 이동 -->
                <li class="nav-item">
                    <a class="nav-link"
                       th:href="@{/department}"
                       th:classappend="${currentPage == 'department'} ? ' active' : ''">
                        <i class="fas fa-university me-1"></i>학과정보
                    </a>
                </li>
            </ul>

            <!-- 로그인 버튼: 네비게이션 바 오른쪽 끝 -->
            <a class="btn btn-outline-light btn-sm px-3" th:href="@{/login}">
                <i class="fas fa-sign-in-alt me-1"></i>로그인
            </a>
        </div>
    </div>
</nav>
<!-- ===== 네비게이션 바 fragment 끝 ===== -->


<!-- ========================================
     푸터 fragment
     각 페이지에서 th:replace로 삽입됩니다.
     ======================================== -->
<footer class="site-footer mt-5" th:fragment="footer">
    <div class="container text-center py-3">
        <p class="mb-1">
            <i class="fas fa-graduation-cap me-1"></i>
            <strong>컴퓨터공학과</strong> 정보통합서비스
        </p>
        <p class="mb-0 small">© 2025 Department Information Portal. All rights reserved.</p>
    </div>
</footer>
<!-- ===== 푸터 fragment 끝 ===== -->

</body>
</html>
```

- [x] **Step 2: 커밋**

```bash
git add demo/demo/src/main/resources/templates/layout/
git commit -m "feat: 공통 레이아웃 fragment (navbar, footer) 추가"
```

---

## Task 5: custom.css 작성

**Files:**
- Create: `demo/demo/src/main/resources/static/css/custom.css`

- [x] **Step 1: custom.css 작성**

`demo/demo/src/main/resources/static/css/custom.css`

```css
/* =====================================================
   학과 정보통합 서비스 - 공통 커스텀 CSS
   Bootstrap 5 위에 덮어쓰는 추가 스타일
   색상 테마: 클래식 블루 (#1e3a8a 기반)
   ===================================================== */


/* ===== 전체 공통 ===== */
body {
    background-color: #f0f4ff;
    /* 한글 가독성을 위한 폰트 설정 */
    font-family: 'Noto Sans KR', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
}


/* ===== 네비게이션 바 ===== */
#mainNav {
    background-color: #1e3a8a;  /* 딥 네이비 */
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
    /* 스크롤 시 부드럽게 나타나도록 */
    transition: box-shadow 0.3s ease;
}

#mainNav .navbar-brand {
    color: #ffffff;
    font-size: 1.1rem;
    letter-spacing: -0.3px;
}

#mainNav .navbar-brand:hover {
    color: #bfdbfe;
}

/* 네비게이션 링크 기본 상태 */
#mainNav .nav-link {
    color: #bfdbfe;
    padding: 8px 14px;
    border-radius: 6px;
    transition: color 0.2s ease, background-color 0.2s ease;
}

/* 네비게이션 링크 호버·활성 상태 */
#mainNav .nav-link:hover,
#mainNav .nav-link.active {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.12);
}

/* 모바일 햄버거 버튼 */
#mainNav .navbar-toggler {
    border-color: rgba(255, 255, 255, 0.3);
}

#mainNav .navbar-toggler-icon {
    /* Bootstrap 기본 아이콘을 흰색 버전으로 교체 */
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255,255,255,0.8)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}


/* ===== 히어로 배너 ===== */
.hero-banner {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
    color: white;
    padding: 56px 0 48px;
}

.hero-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
}

.hero-subtitle {
    color: #93c5fd;
    font-size: 1rem;
    margin-bottom: 0;
}

/* 히어로 배너 D-Day 배지 */
.d-day-badge {
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.35);
    color: #ffffff;
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    backdrop-filter: blur(4px);
    /* 배지 간 부드러운 전환 */
    transition: background 0.2s;
}

.d-day-badge:hover {
    background: rgba(255, 255, 255, 0.28);
}


/* ===== 콘텐츠 카드 (공지·게시글·일정 공통) ===== */
.content-card {
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 14px rgba(0, 0, 0, 0.07);
    /* 카드 진입 시 부드러운 상승 효과 */
    transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.content-card:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

/* 카드 헤더: 각 섹션별 색상 */
.content-card-header {
    padding: 14px 18px;
    font-weight: 600;
    color: #ffffff;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.notice-header   { background-color: #1d4ed8; }  /* 공지사항: 블루 */
.board-header    { background-color: #0f766e; }  /* 게시판: 틸 */
.schedule-header { background-color: #b45309; }  /* 일정: 앰버 */


/* ===== 목록 아이템 (공지·게시글) ===== */
.notice-item {
    border-left: none !important;
    border-right: none !important;
    padding: 11px 18px;
    transition: background-color 0.15s ease;
}

.notice-item:hover {
    background-color: #f0f4ff;
}

/* 목록 내 링크 텍스트 */
.notice-link {
    color: #1e293b;
    text-decoration: none;
    font-size: 0.9rem;
    /* 한 줄 넘치면 말줄임 처리 */
    display: inline-block;
    max-width: 75%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: middle;
}

.notice-link:hover {
    color: #1d4ed8;
    text-decoration: underline;
}


/* ===== 일정 배지 ===== */
.schedule-badge {
    background-color: #dbeafe;
    color: #1e40af;
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    border: 1px solid #bfdbfe;
    transition: background-color 0.2s;
}

.schedule-badge:hover {
    background-color: #bfdbfe;
}


/* ===== 빠른 바로가기 버튼 ===== */
.shortcut-btn {
    display: block;
    background: #ffffff;
    border: 2px solid #dbeafe;
    border-radius: 14px;
    padding: 22px 12px;
    color: #1e40af;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.22s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.shortcut-btn:hover {
    background: #1d4ed8;
    border-color: #1d4ed8;
    color: #ffffff;
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(29, 78, 216, 0.28);
}


/* ===== 푸터 ===== */
.site-footer {
    background-color: #1e3a8a;
    color: #93c5fd;
    font-size: 0.85rem;
    border-top: 3px solid #1d4ed8;
}


/* ===== 플레이스홀더 페이지 (팀원 작업 전 임시 화면) ===== */
.placeholder-page {
    min-height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.placeholder-page .placeholder-icon {
    color: #93c5fd;
    font-size: 3.5rem;
}

.placeholder-page h2 {
    color: #1e3a8a;
    font-weight: 700;
}

.placeholder-page p {
    color: #64748b;
    font-size: 1.05rem;
}


/* ===== 반응형: 모바일 (768px 미만) ===== */
@media (max-width: 768px) {
    .hero-title {
        font-size: 1.4rem;
    }

    .hero-banner {
        padding: 36px 0 32px;
    }

    .notice-link {
        max-width: 60%;
    }
}
```

- [x] **Step 2: 커밋**

```bash
git add demo/demo/src/main/resources/static/css/custom.css
git commit -m "feat: 클래식 블루 테마 커스텀 CSS 추가"
```

---

## Task 6: MainController + 메인 페이지 (TDD)

**Files:**
- Create: `demo/demo/src/test/java/com/example/demo/controller/MainControllerTest.java`
- Create: `demo/demo/src/main/java/com/example/demo/controller/MainController.java`
- Create: `demo/demo/src/main/resources/templates/main/index.html`

- [x] **Step 1: 실패하는 테스트 작성**

`demo/demo/src/test/java/com/example/demo/controller/MainControllerTest.java`

```java
package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 메인 페이지 컨트롤러 테스트
 * 연결 컨트롤러: MainController → templates/main/index.html
 */
@WebMvcTest(MainController.class)
class MainControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    @DisplayName("메인 페이지 GET / → 200 OK, main/index 뷰 반환")
    void 메인페이지_정상_로드() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("main/index"))
                // 더미 데이터 3종이 모델에 담겨 있는지 확인
                .andExpect(model().attributeExists("notices"))
                .andExpect(model().attributeExists("posts"))
                .andExpect(model().attributeExists("schedules"))
                .andExpect(model().attributeExists("today"));
    }
}
```

- [x] **Step 2: 테스트 실행 → 실패 확인**

```bash
cd demo/demo && ./mvnw.cmd test -pl . -Dtest=MainControllerTest -q
```

예상 출력: `FAILED` (MainController가 없어서)

- [x] **Step 3: MainController 구현**

`demo/demo/src/main/java/com/example/demo/controller/MainController.java`

```java
package com.example.demo.controller;

import com.example.demo.dto.NoticeDto;
import com.example.demo.dto.PostDto;
import com.example.demo.dto.ScheduleDto;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * 메인 페이지 컨트롤러
 * - URL: GET /
 * - 렌더링 템플릿: templates/main/index.html
 * - 더미 데이터로 공지사항·게시글·일정을 제공합니다.
 * - TODO: [팀원] noticeService, postService, scheduleService 주입 후
 *          더미 데이터 List.of(...)를 서비스 호출로 교체해주세요.
 */
@Controller
public class MainController {

    @GetMapping("/")
    public String index(Model model) {

        // 더미 공지사항 데이터 (최신순 5개)
        // TODO: [팀원-공지사항] noticeService.getTop5() 로 교체
        model.addAttribute("notices", List.of(
            new NoticeDto(1L, "2025년 1학기 수강신청 일정 안내", "2025-05-08", "학과사무실"),
            new NoticeDto(2L, "졸업논문 제출 마감 안내",         "2025-05-06", "학과사무실"),
            new NoticeDto(3L, "장학금 신청 안내 (5월 15일까지)", "2025-05-04", "학생처"),
            new NoticeDto(4L, "실험실 안전교육 일정 공지",       "2025-05-02", "학과사무실"),
            new NoticeDto(5L, "2025 산학협력 세미나 개최 안내",  "2025-04-30", "학과사무실")
        ));

        // 더미 인기 게시글 데이터 (좋아요 순 5개)
        // TODO: [팀원-게시판] postService.getTop5ByLikes() 로 교체
        model.addAttribute("posts", List.of(
            new PostDto(1L, "중간고사 자료구조 족보 공유합니다",    "박민수", 45),
            new PostDto(2L, "카카오 인턴십 합격 후기 (2025 상반기)", "이철수", 32),
            new PostDto(3L, "알고리즘 스터디 같이 할 분 모집",      "홍길동", 24),
            new PostDto(4L, "졸업작품 팀원 구합니다 (4인 팀)",      "김영희", 18),
            new PostDto(5L, "교수님 연구실 학부 인턴 모집 공고",    "정교수", 12)
        ));

        // 더미 다가오는 일정 데이터 (D-Day 포함)
        // TODO: [팀원-일정] scheduleService.getUpcoming() 로 교체
        model.addAttribute("schedules", List.of(
            new ScheduleDto(1L, "중간고사 시작",   "2025-05-12",  4),
            new ScheduleDto(2L, "프로젝트 발표",   "2025-05-20", 12),
            new ScheduleDto(3L, "학과 축제",       "2025-06-01", 24),
            new ScheduleDto(4L, "기말고사 시작",   "2025-06-16", 39),
            new ScheduleDto(5L, "여름 방학 시작",  "2025-06-27", 50)
        ));

        // 오늘 날짜 (히어로 배너에 표시)
        String today = LocalDate.now()
            .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 EEEE", Locale.KOREAN));
        model.addAttribute("today", today);

        // 현재 페이지 식별자 (네비게이션 바 활성 메뉴 표시용)
        model.addAttribute("currentPage", "main");

        return "main/index";  // templates/main/index.html 렌더링
    }
}
```

- [x] **Step 4: 메인 페이지 템플릿 작성**

`demo/demo/src/main/resources/templates/main/index.html`

```html
<!DOCTYPE html>
<!--
  메인 페이지 템플릿
  연결 컨트롤러: MainController (GET /)
  사용 모델 변수:
    - notices   : List<NoticeDto>   (최신 공지사항 5개)
    - posts     : List<PostDto>     (인기 게시글 5개)
    - schedules : List<ScheduleDto> (다가오는 일정)
    - today     : String            (오늘 날짜 문자열)
    - currentPage: "main"
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>학과정보통합서비스</title>

    <!-- Bootstrap 5.3 CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet">
    <!-- Font Awesome 6.5 CDN (아이콘) -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          rel="stylesheet">
    <!-- 커스텀 CSS: static/css/custom.css -->
    <link th:href="@{/css/custom.css}" rel="stylesheet">
</head>
<body>

<!-- 네비게이션 바 삽입: layout/base.html의 navbar fragment -->
<div th:replace="~{layout/base :: navbar}"></div>


<!-- ===== 히어로 배너 섹션 ===== -->
<!-- MainController에서 today, schedules 변수를 받아 표시 -->
<section class="hero-banner">
    <div class="container text-center">

        <!-- 학과명 타이틀 -->
        <h1 class="hero-title">
            <i class="fas fa-graduation-cap me-3"></i>컴퓨터공학과 정보 포털
        </h1>

        <!-- 오늘 날짜: MainController에서 today 변수로 전달 -->
        <p class="hero-subtitle" th:text="${today}">날짜 로딩 중...</p>

        <!-- D-Day 배지: 14일 이내 일정만 표시 -->
        <div class="d-flex justify-content-center flex-wrap gap-2 mt-3">
            <span class="d-day-badge"
                  th:each="s : ${schedules}"
                  th:if="${s.dday >= 0 and s.dday <= 14}">
                <i class="fas fa-clock me-1"></i>
                <span th:text="${s.title}">일정명</span>
                <strong class="ms-1"
                        th:text="${s.dday == 0} ? 'D-Day' : 'D-' + ${s.dday}">D-0</strong>
            </span>
        </div>
    </div>
</section>
<!-- ===== 히어로 배너 섹션 끝 ===== -->


<!-- ===== 메인 콘텐츠 영역 ===== -->
<main class="container my-4">

    <!-- 공지사항 + 인기게시글 2열 그리드 -->
    <div class="row g-4 mb-4">

        <!-- 최신 공지사항 카드: MainController의 notices(List<NoticeDto>) 렌더링 -->
        <div class="col-md-6">
            <div class="content-card h-100">
                <div class="content-card-header notice-header">
                    <span><i class="fas fa-bullhorn me-2"></i>최신 공지사항</span>
                    <!-- 더보기 버튼: 공지사항 목록 페이지(/notice)로 이동 -->
                    <a th:href="@{/notice}" class="btn btn-sm btn-outline-light">
                        더보기 <i class="fas fa-chevron-right ms-1"></i>
                    </a>
                </div>

                <ul class="list-group list-group-flush">
                    <!-- notices 리스트 반복 출력 -->
                    <li class="list-group-item notice-item"
                        th:each="notice : ${notices}">
                        <!-- 제목 클릭 시 /notice로 이동 (팀원이 상세 URL로 교체 예정) -->
                        <a th:href="@{/notice}" class="notice-link"
                           th:text="${notice.title}">공지 제목</a>
                        <small class="text-muted float-end"
                               th:text="${notice.date}">날짜</small>
                    </li>
                    <!-- 공지사항이 없을 때 표시 -->
                    <li class="list-group-item text-muted text-center py-4"
                        th:if="${#lists.isEmpty(notices)}">
                        <i class="fas fa-inbox me-2"></i>공지사항이 없습니다.
                    </li>
                </ul>
            </div>
        </div>

        <!-- 인기 게시글 카드: MainController의 posts(List<PostDto>) 렌더링 -->
        <div class="col-md-6">
            <div class="content-card h-100">
                <div class="content-card-header board-header">
                    <span><i class="fas fa-fire me-2"></i>인기 게시글</span>
                    <!-- 더보기 버튼: 게시판 목록 페이지(/board)로 이동 -->
                    <a th:href="@{/board}" class="btn btn-sm btn-outline-light">
                        더보기 <i class="fas fa-chevron-right ms-1"></i>
                    </a>
                </div>

                <ul class="list-group list-group-flush">
                    <!-- posts 리스트 반복 출력 -->
                    <li class="list-group-item notice-item"
                        th:each="post : ${posts}">
                        <!-- 제목 클릭 시 /board로 이동 (팀원이 상세 URL로 교체 예정) -->
                        <a th:href="@{/board}" class="notice-link"
                           th:text="${post.title}">게시글 제목</a>
                        <small class="text-muted float-end">
                            <i class="fas fa-thumbs-up me-1 text-primary"></i>
                            <span th:text="${post.likes}">0</span>
                        </small>
                    </li>
                    <!-- 게시글이 없을 때 표시 -->
                    <li class="list-group-item text-muted text-center py-4"
                        th:if="${#lists.isEmpty(posts)}">
                        <i class="fas fa-inbox me-2"></i>게시글이 없습니다.
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <!-- 2열 그리드 끝 -->


    <!-- 다가오는 일정 (풀폭): MainController의 schedules(List<ScheduleDto>) 렌더링 -->
    <div class="content-card mb-4">
        <div class="content-card-header schedule-header">
            <span><i class="fas fa-calendar-alt me-2"></i>다가오는 일정</span>
            <!-- 전체보기 버튼: 일정 페이지(/schedule)로 이동 -->
            <a th:href="@{/schedule}" class="btn btn-sm btn-outline-light">
                전체보기 <i class="fas fa-chevron-right ms-1"></i>
            </a>
        </div>
        <div class="p-3">
            <!-- schedules 리스트 배지 형태로 출력 -->
            <div class="d-flex flex-wrap gap-2" th:if="${!#lists.isEmpty(schedules)}">
                <span class="schedule-badge" th:each="s : ${schedules}">
                    <i class="fas fa-circle-dot me-1"></i>
                    <span th:text="${s.date}">날짜</span>
                    <strong class="ms-1" th:text="${s.title}">일정명</strong>
                </span>
            </div>
            <!-- 일정이 없을 때 표시 -->
            <p class="text-muted mb-0" th:if="${#lists.isEmpty(schedules)}">
                <i class="fas fa-calendar-xmark me-2"></i>등록된 일정이 없습니다.
            </p>
        </div>
    </div>


    <!-- 빠른 바로가기 버튼 그룹 -->
    <div class="row g-3 text-center">
        <!-- 공지사항 바로가기 -->
        <div class="col-6 col-md-3">
            <a th:href="@{/notice}" class="shortcut-btn">
                <i class="fas fa-bullhorn fa-2x d-block mb-2"></i>공지사항
            </a>
        </div>
        <!-- 게시판 바로가기 -->
        <div class="col-6 col-md-3">
            <a th:href="@{/board}" class="shortcut-btn">
                <i class="fas fa-comments fa-2x d-block mb-2"></i>게시판
            </a>
        </div>
        <!-- 일정 바로가기 -->
        <div class="col-6 col-md-3">
            <a th:href="@{/schedule}" class="shortcut-btn">
                <i class="fas fa-calendar-alt fa-2x d-block mb-2"></i>일정
            </a>
        </div>
        <!-- 학과정보 바로가기 -->
        <div class="col-6 col-md-3">
            <a th:href="@{/department}" class="shortcut-btn">
                <i class="fas fa-university fa-2x d-block mb-2"></i>학과정보
            </a>
        </div>
    </div>

</main>
<!-- ===== 메인 콘텐츠 영역 끝 ===== -->


<!-- 푸터 삽입: layout/base.html의 footer fragment -->
<div th:replace="~{layout/base :: footer}"></div>

<!-- Bootstrap 5.3 JS CDN (모바일 햄버거 메뉴 동작에 필요) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

- [x] **Step 5: 테스트 실행 → 통과 확인**

```bash
cd demo/demo && ./mvnw.cmd test -Dtest=MainControllerTest -q
```

예상 출력: `Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`

- [x] **Step 6: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/MainController.java \
        demo/demo/src/main/resources/templates/main/ \
        demo/demo/src/test/java/com/example/demo/controller/MainControllerTest.java
git commit -m "feat: 메인 페이지 컨트롤러 + 템플릿 구현 (더미 데이터)"
```

---

## Task 7: 플레이스홀더 페이지 5개 구현 (TDD)

**Files:**
- Create: `controller/NoticeController.java`, `BoardController.java`, `ScheduleController.java`, `DepartmentController.java`, `AuthController.java`
- Create: `templates/notice/list.html`, `board/list.html`, `schedule/list.html`, `department/index.html`, `auth/login.html`
- Create: `controller/NoticeControllerTest.java`, `BoardControllerTest.java`, `ScheduleControllerTest.java`, `DepartmentControllerTest.java`, `AuthControllerTest.java`

모두 동일한 패턴이므로 한 번에 작성한다.

- [x] **Step 1: 테스트 5개 작성**

`demo/demo/src/test/java/com/example/demo/controller/NoticeControllerTest.java`
```java
package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 공지사항 페이지 컨트롤러 테스트 — 연결: NoticeController → notice/list.html */
@WebMvcTest(NoticeController.class)
class NoticeControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("공지사항 GET /notice → 200 OK, notice/list 뷰")
    void 공지사항페이지_정상_로드() throws Exception {
        mockMvc.perform(get("/notice"))
                .andExpect(status().isOk())
                .andExpect(view().name("notice/list"))
                .andExpect(model().attribute("currentPage", "notice"));
    }
}
```

`demo/demo/src/test/java/com/example/demo/controller/BoardControllerTest.java`
```java
package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 게시판 페이지 컨트롤러 테스트 — 연결: BoardController → board/list.html */
@WebMvcTest(BoardController.class)
class BoardControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("게시판 GET /board → 200 OK, board/list 뷰")
    void 게시판페이지_정상_로드() throws Exception {
        mockMvc.perform(get("/board"))
                .andExpect(status().isOk())
                .andExpect(view().name("board/list"))
                .andExpect(model().attribute("currentPage", "board"));
    }
}
```

`demo/demo/src/test/java/com/example/demo/controller/ScheduleControllerTest.java`
```java
package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 일정 페이지 컨트롤러 테스트 — 연결: ScheduleController → schedule/list.html */
@WebMvcTest(ScheduleController.class)
class ScheduleControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("일정 GET /schedule → 200 OK, schedule/list 뷰")
    void 일정페이지_정상_로드() throws Exception {
        mockMvc.perform(get("/schedule"))
                .andExpect(status().isOk())
                .andExpect(view().name("schedule/list"))
                .andExpect(model().attribute("currentPage", "schedule"));
    }
}
```

`demo/demo/src/test/java/com/example/demo/controller/DepartmentControllerTest.java`
```java
package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 학과정보 페이지 컨트롤러 테스트 — 연결: DepartmentController → department/index.html */
@WebMvcTest(DepartmentController.class)
class DepartmentControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("학과정보 GET /department → 200 OK, department/index 뷰")
    void 학과정보페이지_정상_로드() throws Exception {
        mockMvc.perform(get("/department"))
                .andExpect(status().isOk())
                .andExpect(view().name("department/index"))
                .andExpect(model().attribute("currentPage", "department"));
    }
}
```

`demo/demo/src/test/java/com/example/demo/controller/AuthControllerTest.java`
```java
package com.example.demo.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** 로그인 페이지 컨트롤러 테스트 — 연결: AuthController → auth/login.html */
@WebMvcTest(AuthController.class)
class AuthControllerTest {
    @Autowired MockMvc mockMvc;

    @Test
    @DisplayName("로그인 GET /login → 200 OK, auth/login 뷰")
    void 로그인페이지_정상_로드() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk())
                .andExpect(view().name("auth/login"))
                .andExpect(model().attribute("currentPage", "login"));
    }
}
```

- [x] **Step 2: 컨트롤러 5개 작성**

`demo/demo/src/main/java/com/example/demo/controller/NoticeController.java`
```java
package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 공지사항 페이지 컨트롤러
 * - URL: GET /notice
 * - 렌더링 템플릿: templates/notice/list.html
 * - TODO: [팀원-공지사항 담당] 이 컨트롤러에 공지사항 서비스 로직을 구현해주세요
 */
@Controller
public class NoticeController {

    @GetMapping("/notice")
    public String list(Model model) {
        // 현재 페이지 식별자 (네비게이션 바 활성 메뉴 표시용)
        model.addAttribute("currentPage", "notice");
        return "notice/list";  // templates/notice/list.html 렌더링
    }
}
```

`demo/demo/src/main/java/com/example/demo/controller/BoardController.java`
```java
package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 게시판 페이지 컨트롤러
 * - URL: GET /board
 * - 렌더링 템플릿: templates/board/list.html
 * - TODO: [팀원-게시판 담당] 이 컨트롤러에 게시판 서비스 로직을 구현해주세요
 */
@Controller
public class BoardController {

    @GetMapping("/board")
    public String list(Model model) {
        model.addAttribute("currentPage", "board");
        return "board/list";  // templates/board/list.html 렌더링
    }
}
```

`demo/demo/src/main/java/com/example/demo/controller/ScheduleController.java`
```java
package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 일정 페이지 컨트롤러
 * - URL: GET /schedule
 * - 렌더링 템플릿: templates/schedule/list.html
 * - TODO: [팀원-일정 담당] 이 컨트롤러에 일정 서비스 로직을 구현해주세요
 */
@Controller
public class ScheduleController {

    @GetMapping("/schedule")
    public String list(Model model) {
        model.addAttribute("currentPage", "schedule");
        return "schedule/list";  // templates/schedule/list.html 렌더링
    }
}
```

`demo/demo/src/main/java/com/example/demo/controller/DepartmentController.java`
```java
package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 학과정보 페이지 컨트롤러
 * - URL: GET /department
 * - 렌더링 템플릿: templates/department/index.html
 * - TODO: [팀원-학과정보 담당] 이 컨트롤러에 학과정보 서비스 로직을 구현해주세요
 */
@Controller
public class DepartmentController {

    @GetMapping("/department")
    public String index(Model model) {
        model.addAttribute("currentPage", "department");
        return "department/index";  // templates/department/index.html 렌더링
    }
}
```

`demo/demo/src/main/java/com/example/demo/controller/AuthController.java`
```java
package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 인증(로그인) 페이지 컨트롤러
 * - URL: GET /login
 * - 렌더링 템플릿: templates/auth/login.html
 * - TODO: [팀원-인증 담당] 이 컨트롤러에 로그인·로그아웃 서비스 로직을 구현해주세요
 */
@Controller
public class AuthController {

    @GetMapping("/login")
    public String login(Model model) {
        model.addAttribute("currentPage", "login");
        return "auth/login";  // templates/auth/login.html 렌더링
    }
}
```

- [x] **Step 3: 플레이스홀더 템플릿 5개 작성**

아래 5개 파일은 동일한 구조로 작성한다. `PAGE_NAME`, `PAGE_TITLE`, `PAGE_ICON`, `PAGE_COLOR`, `PAGE_URL`, `CONTROLLER_NAME`만 각각 다르다.

`demo/demo/src/main/resources/templates/notice/list.html`
```html
<!DOCTYPE html>
<!--
  공지사항 페이지 (플레이스홀더)
  연결 컨트롤러: NoticeController (GET /notice)
  TODO: [팀원-공지사항 담당] 이 파일에 공지사항 목록 UI를 구현해주세요
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>공지사항 | 학과정보통합서비스</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link th:href="@{/css/custom.css}" rel="stylesheet">
</head>
<body>
    <!-- 네비게이션 바 삽입 -->
    <div th:replace="~{layout/base :: navbar}"></div>

    <!-- 플레이스홀더 콘텐츠: 팀원이 이 영역을 교체합니다 -->
    <main class="placeholder-page">
        <i class="fas fa-bullhorn placeholder-icon"></i>
        <h2>공지사항</h2>
        <p>🚧 이 페이지는 팀원이 구현 예정입니다.</p>
        <p class="text-muted small">담당: NoticeController → notice/list.html</p>
        <a th:href="@{/}" class="btn btn-primary mt-2">
            <i class="fas fa-home me-1"></i>메인으로 돌아가기
        </a>
    </main>

    <div th:replace="~{layout/base :: footer}"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

`demo/demo/src/main/resources/templates/board/list.html`
```html
<!DOCTYPE html>
<!--
  게시판 페이지 (플레이스홀더)
  연결 컨트롤러: BoardController (GET /board)
  TODO: [팀원-게시판 담당] 이 파일에 게시판 목록 UI를 구현해주세요
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>게시판 | 학과정보통합서비스</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link th:href="@{/css/custom.css}" rel="stylesheet">
</head>
<body>
    <div th:replace="~{layout/base :: navbar}"></div>

    <main class="placeholder-page">
        <i class="fas fa-comments placeholder-icon"></i>
        <h2>게시판</h2>
        <p>🚧 이 페이지는 팀원이 구현 예정입니다.</p>
        <p class="text-muted small">담당: BoardController → board/list.html</p>
        <a th:href="@{/}" class="btn btn-primary mt-2">
            <i class="fas fa-home me-1"></i>메인으로 돌아가기
        </a>
    </main>

    <div th:replace="~{layout/base :: footer}"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

`demo/demo/src/main/resources/templates/schedule/list.html`
```html
<!DOCTYPE html>
<!--
  일정 페이지 (플레이스홀더)
  연결 컨트롤러: ScheduleController (GET /schedule)
  TODO: [팀원-일정 담당] 이 파일에 일정 UI를 구현해주세요
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>일정 | 학과정보통합서비스</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link th:href="@{/css/custom.css}" rel="stylesheet">
</head>
<body>
    <div th:replace="~{layout/base :: navbar}"></div>

    <main class="placeholder-page">
        <i class="fas fa-calendar-alt placeholder-icon"></i>
        <h2>일정</h2>
        <p>🚧 이 페이지는 팀원이 구현 예정입니다.</p>
        <p class="text-muted small">담당: ScheduleController → schedule/list.html</p>
        <a th:href="@{/}" class="btn btn-primary mt-2">
            <i class="fas fa-home me-1"></i>메인으로 돌아가기
        </a>
    </main>

    <div th:replace="~{layout/base :: footer}"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

`demo/demo/src/main/resources/templates/department/index.html`
```html
<!DOCTYPE html>
<!--
  학과정보 페이지 (플레이스홀더)
  연결 컨트롤러: DepartmentController (GET /department)
  TODO: [팀원-학과정보 담당] 이 파일에 학과정보 UI를 구현해주세요
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>학과정보 | 학과정보통합서비스</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link th:href="@{/css/custom.css}" rel="stylesheet">
</head>
<body>
    <div th:replace="~{layout/base :: navbar}"></div>

    <main class="placeholder-page">
        <i class="fas fa-university placeholder-icon"></i>
        <h2>학과정보</h2>
        <p>🚧 이 페이지는 팀원이 구현 예정입니다.</p>
        <p class="text-muted small">담당: DepartmentController → department/index.html</p>
        <a th:href="@{/}" class="btn btn-primary mt-2">
            <i class="fas fa-home me-1"></i>메인으로 돌아가기
        </a>
    </main>

    <div th:replace="~{layout/base :: footer}"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

`demo/demo/src/main/resources/templates/auth/login.html`
```html
<!DOCTYPE html>
<!--
  로그인 페이지 (플레이스홀더)
  연결 컨트롤러: AuthController (GET /login)
  TODO: [팀원-인증 담당] 이 파일에 로그인 폼 UI를 구현해주세요
-->
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>로그인 | 학과정보통합서비스</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link th:href="@{/css/custom.css}" rel="stylesheet">
</head>
<body>
    <div th:replace="~{layout/base :: navbar}"></div>

    <main class="placeholder-page">
        <i class="fas fa-sign-in-alt placeholder-icon"></i>
        <h2>로그인</h2>
        <p>🚧 이 페이지는 팀원이 구현 예정입니다.</p>
        <p class="text-muted small">담당: AuthController → auth/login.html</p>
        <a th:href="@{/}" class="btn btn-primary mt-2">
            <i class="fas fa-home me-1"></i>메인으로 돌아가기
        </a>
    </main>

    <div th:replace="~{layout/base :: footer}"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

- [x] **Step 4: 전체 테스트 실행 → 6개 통과 확인**

```bash
cd demo/demo && ./mvnw.cmd test -q
```

예상 출력:
```
Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

- [x] **Step 5: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/ \
        demo/demo/src/main/resources/templates/ \
        demo/demo/src/test/java/com/example/demo/controller/
git commit -m "feat: 플레이스홀더 페이지 5개 (공지·게시판·일정·학과정보·로그인) 추가"
```

---

## Task 8: 전체 동작 확인 및 최종 커밋

- [x] **Step 1: 전체 테스트 통과 확인**

```bash
cd demo/demo && ./mvnw.cmd test
```

예상 출력:
```
Tests run: 7, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

(DemoApplicationTests 1개 + 각 컨트롤러 6개 = 7개)

- [x] **Step 2: 앱 실행**

```bash
cd demo/demo && ./mvnw.cmd spring-boot:run
```

예상 출력: `Tomcat started on port 8080`

- [x] **Step 3: 브라우저에서 전체 라우팅 확인**

아래 URL을 순서대로 열어 각 페이지가 정상 표시되는지 확인한다.

| URL | 예상 화면 |
|---|---|
| `http://localhost:8080/` | 히어로 배너 + 공지사항 + 게시글 + 일정 + 바로가기 |
| `http://localhost:8080/notice` | 공지사항 플레이스홀더 (🚧 안내 메시지) |
| `http://localhost:8080/board` | 게시판 플레이스홀더 |
| `http://localhost:8080/schedule` | 일정 플레이스홀더 |
| `http://localhost:8080/department` | 학과정보 플레이스홀더 |
| `http://localhost:8080/login` | 로그인 플레이스홀더 |

모든 페이지에서 네비게이션 바가 표시되고 각 메뉴 클릭 시 해당 페이지로 이동해야 한다.

- [x] **Step 4: 최종 커밋 (변경 사항이 있을 경우)**

```bash
git add -A
git commit -m "chore: 뼈대 구축 완료 — 전체 라우팅 및 UI 동작 확인"
```

---

## 구현 완료 후 팀원 인수인계 사항

```
각 팀원이 담당 페이지를 구현할 때:

1. 해당 Controller 파일에서 TODO 주석을 찾아 Service 주입 및 로직 구현
2. 해당 templates/*.html 파일에서 플레이스홀더를 실제 UI로 교체
3. dto/ 폴더의 DTO 클래스는 Entity ↔ DTO 변환에 재사용 가능
4. DB 연동 시 db-config-template.txt 참고하여 application-secret.properties 작성
5. application.properties의 spring.autoconfigure.exclude 3줄 제거 후 앱 재시작
```
