# 학과 정보통합 서비스 웹 포털 — 설계 문서

**작성일:** 2026-05-08  
**작성자:** Jinsung (뼈대 구축 담당)  
**상태:** 승인됨

---

## 1. 프로젝트 개요

### 목적
여러 곳에 분산된 학과 관련 정보(공지사항, 게시판, 일정, 학과정보)를 한 곳에 모아 한눈에 볼 수 있도록 하는 웹 포털 서비스 구축.

### 역할 분담 방식
- **Jinsung (현재):** 전체 뼈대(라우팅, 레이아웃, 더미 데이터, 공통 UI) 구축
- **팀원들:** 각 담당 페이지의 실제 기능 및 DB 연동 구현

### 현재 단계 목표
- 모든 페이지로의 라우팅 동작 확인
- 더미 데이터로 UI 레이아웃 테스트 가능한 환경 제공
- DB 없이도 서버가 정상 기동되는 상태 유지

---

## 2. 기술 스택

| 구분 | 기술 | 비고 |
|---|---|---|
| 백엔드 프레임워크 | Spring Boot 4.0.6 | Java 17 |
| 뷰 템플릿 엔진 | Thymeleaf | 서버사이드 렌더링 |
| CSS 프레임워크 | Bootstrap 5.3 | CDN 방식 (설치 불필요) |
| 아이콘 | Font Awesome 6 | CDN 방식 |
| ORM | Spring Data JPA | 뼈대 단계에서는 더미 데이터 사용 |
| 데이터베이스 | Oracle AI Database | ojdbc11 드라이버 |
| 빌드 도구 | Maven | pom.xml |
| 버전 관리 | Git | 팀원과 공유 |

---

## 3. 아키텍처

```
브라우저
  ↓ HTTP 요청
Spring Boot (내장 Tomcat, 기본 포트 8080)
  ↓ @Controller → Model에 더미 데이터 담기
Thymeleaf 템플릿 엔진
  ↓ layout/base.html 상속
HTML 렌더링 → 브라우저에 응답
  ↓ (팀원 구현 후)
Service → Repository → JPA → Oracle DB
```

**뼈대 단계:** Controller가 Service 없이 더미 데이터를 직접 Model에 담아 전달.  
**팀원 확장 후:** Controller → Service → Repository → DB 흐름으로 교체.

---

## 4. 페이지 및 라우팅

| URL | 컨트롤러 | 템플릿 | 담당 | 상태 |
|---|---|---|---|---|
| `/` | `MainController` | `main/index.html` | Jinsung | 뼈대 구현 |
| `/notice` | `NoticeController` | `notice/list.html` | 팀원 | 플레이스홀더 |
| `/board` | `BoardController` | `board/list.html` | 팀원 | 플레이스홀더 |
| `/schedule` | `ScheduleController` | `schedule/list.html` | 팀원 | 플레이스홀더 |
| `/department` | `DepartmentController` | `department/index.html` | 팀원 | 플레이스홀더 |
| `/login` | `AuthController` | `auth/login.html` | 팀원 | 플레이스홀더 |

---

## 5. UI 설계

### 5.1 디자인 컨셉
- **레이아웃:** 히어로 배너 + 2+1 그리드 (옵션 B)
- **색상 테마:** 클래식 블루 (옵션 A) — 네이비(#1e3a8a) 기반, 포인트 컬러 #2563eb

### 5.2 네비게이션 바 (공통, 모든 페이지 유지)
```
[🎓 학과정보통합서비스]  [공지사항] [게시판] [일정] [학과정보]  [🔑 로그인]
```
- 상단 고정(sticky), 스크롤 시 shadow 효과
- 활성 메뉴 하이라이트 (Thymeleaf `th:classappend` 활용)
- 반응형 (모바일에서 햄버거 메뉴)

### 5.3 메인 페이지 구성
1. **히어로 배너:** 오늘 날짜, 다가오는 이벤트 D-Day 카운터
2. **2열 그리드:** 최신 공지사항 카드 / 인기 게시글 카드
3. **풀폭:** 다가오는 일정 (태그 형태)
4. **추가 섹션 (선택):** 빠른 링크 바로가기 버튼 그룹

### 5.4 각 페이지 플레이스홀더
팀원이 작업 전까지 "🚧 이 페이지는 팀원이 구현 예정입니다" 안내 메시지 표시.

---

## 6. 파일 구조

```
demo/demo/src/main/
├── java/com/example/demo/
│   ├── DemoApplication.java
│   ├── controller/
│   │   ├── MainController.java       ← 메인 페이지, 더미 데이터 주입
│   │   ├── NoticeController.java     ← 공지사항 라우팅
│   │   ├── BoardController.java      ← 게시판 라우팅
│   │   ├── ScheduleController.java   ← 일정 라우팅
│   │   ├── DepartmentController.java ← 학과정보 라우팅
│   │   └── AuthController.java       ← 로그인 라우팅
│   └── dto/
│       ├── NoticeDto.java            ← 공지사항 더미 데이터 구조
│       ├── PostDto.java              ← 게시글 더미 데이터 구조
│       └── ScheduleDto.java          ← 일정 더미 데이터 구조
│
└── resources/
    ├── templates/
    │   ├── layout/
    │   │   └── base.html             ← 공통 레이아웃 (nav, footer)
    │   ├── main/index.html           ← 메인 페이지
    │   ├── notice/list.html          ← 공지사항 플레이스홀더
    │   ├── board/list.html           ← 게시판 플레이스홀더
    │   ├── schedule/list.html        ← 일정 플레이스홀더
    │   ├── department/index.html     ← 학과정보 플레이스홀더
    │   └── auth/login.html           ← 로그인 플레이스홀더
    ├── static/css/custom.css         ← 공통 커스텀 CSS
    ├── application.properties        ← 일반 설정 (git 포함)
    └── application-secret.properties ← DB 비밀정보 (git 제외)
```

---

## 7. DB 설정 관리

### git에서 제외 (application-secret.properties)
```properties
spring.datasource.url=jdbc:oracle:thin:@//호스트:포트/서비스명
spring.datasource.username=사용자명
spring.datasource.password=비밀번호
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
spring.jpa.hibernate.ddl-auto=update
```

### git에 포함 (db-config-template.txt)
팀원이 본인 환경에 맞게 설정할 수 있도록 값 없이 키만 안내.

### .gitignore 추가 항목
```
application-secret.properties
target/
.idea/
*.iml
.superpowers/
```

---

## 8. 더미 데이터 전략

컨트롤러에서 `List.of(...)`로 하드코딩된 DTO 리스트를 Model에 담아 Thymeleaf에 전달.

```java
// 예시: MainController
model.addAttribute("notices", List.of(
    new NoticeDto(1L, "2025년 1학기 수강신청 안내", "2025-05-08", "학과사무실"),
    new NoticeDto(2L, "졸업논문 제출 마감 안내", "2025-05-06", "학과사무실")
));
```

팀원이 Service를 만들면 `model.addAttribute("notices", noticeService.getTop5())` 한 줄 교체로 연동 완료.

---

## 9. 주석 정책

- 모든 주석은 **한글**로 작성
- 각 파일 상단: 파일 역할, 담당 컨트롤러/템플릿 연결 관계 명시
- 팀원이 수정할 영역에 `// TODO: [팀원명] 이 부분을 구현해주세요` 형태로 안내
- HTML 주석으로 어떤 컨트롤러에서 데이터가 오는지 명시
