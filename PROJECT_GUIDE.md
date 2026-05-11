# 학과정보통합서비스 — 프로젝트 가이드

> 이 문서를 읽으면 프로젝트의 전체 구성, 사용 기술, 동작 방식, 구현된 기능을 파악할 수 있습니다.

---

## 1. 프로젝트 개요

**프로젝트명:** 학과정보통합서비스 (dept-portal)

**목적:** 컴퓨터공학과의 공지사항, 게시판, 일정, 학과정보를 하나의 웹 포털로 통합하여 학생과 교직원이 편리하게 접근할 수 있도록 합니다.

**현재 단계:** 뼈대(skeleton) 완성 단계. 모든 페이지의 UI와 더미 데이터가 구현되어 있으며, 팀원이 실제 DB 연동 및 서비스 로직을 추가하면 됩니다.

---

## 2. 기술 스택

| 분류 | 기술 | 버전 | 역할 |
|------|------|------|------|
| 언어 | Java | 17 | 백엔드 전체 |
| 프레임워크 | Spring Boot | 4.0.6 | 웹 애플리케이션 서버 |
| 웹 MVC | Spring Web MVC | (Spring Boot 내장) | URL 라우팅, 컨트롤러 처리 |
| 템플릿 엔진 | Thymeleaf | (Spring Boot 내장) | 서버사이드 HTML 렌더링 |
| DB ORM | Spring Data JPA / Hibernate | (Spring Boot 내장) | DB 연동용 (현재 비활성화) |
| DB | Oracle AI Database | - | 실제 데이터 저장소 (현재 미연동) |
| JDBC 드라이버 | ojdbc11 | 23.9.0.25.07 | Oracle DB 접속 |
| CSS 프레임워크 | Tailwind CSS | CDN (최신) | 모든 페이지 스타일링 |
| 아이콘 | Font Awesome | 6.5.0 (CDN) | 아이콘 |
| 빌드 도구 | Maven (mvnw) | (Spring Boot 내장) | 빌드, 의존성 관리, 테스트 실행 |
| 테스트 프레임워크 | JUnit 5 + MockMvc | (Spring Boot 내장) | 컨트롤러 슬라이스 테스트 |
| 버전 관리 | Git | - | 팀 협업 |

**프론트엔드 방식:** 별도의 JS 프레임워크(React 등) 없음. Thymeleaf로 서버에서 HTML을 완성하여 브라우저에 전달하는 전통적인 SSR(Server-Side Rendering) 방식. 클라이언트 측 JS는 카테고리 필터, 모바일 메뉴 토글 등 최소한의 인터랙션에만 사용.

---

## 3. 프로젝트 디렉터리 구조

```
webprogramming_team-main/
│
├── demo/demo/                          ← Spring Boot 프로젝트 루트
│   ├── pom.xml                         ← Maven 빌드 설정 (의존성 목록)
│   ├── mvnw / mvnw.cmd                 ← Maven Wrapper (./mvnw test 등으로 실행)
│   │
│   └── src/
│       ├── main/
│       │   ├── java/com/example/demo/
│       │   │   │
│       │   │   ├── DemoApplication.java         ← 앱 진입점 (main 메서드)
│       │   │   │
│       │   │   ├── controller/                  ← URL 처리 컨트롤러
│       │   │   │   ├── MainController.java      ← GET /
│       │   │   │   ├── NoticeController.java    ← GET /notice
│       │   │   │   ├── BoardController.java     ← GET /board
│       │   │   │   ├── ScheduleController.java  ← GET /schedule
│       │   │   │   ├── DepartmentController.java← GET /department
│       │   │   │   └── AuthController.java      ← GET /login
│       │   │   │
│       │   │   └── dto/                         ← 데이터 전송 객체
│       │   │       ├── NoticeDto.java           ← 공지사항 데이터 구조
│       │   │       ├── PostDto.java             ← 게시글 데이터 구조
│       │   │       └── ScheduleDto.java         ← 일정 데이터 구조
│       │   │
│       │   └── resources/
│       │       ├── application.properties       ← 앱 설정 (포트, DB 제외 설정 등)
│       │       ├── application-secret.properties← DB 접속 정보 (Git 미포함, 각자 생성)
│       │       │
│       │       ├── static/
│       │       │   └── css/custom.css           ← 레거시 CSS (현재 미사용, 잔존 파일)
│       │       │
│       │       └── templates/                   ← Thymeleaf HTML 템플릿
│       │           ├── layout/base.html         ← 공통 레이아웃 fragment (레거시, 미사용)
│       │           ├── main/index.html          ← 메인 페이지
│       │           ├── notice/list.html         ← 공지사항 목록 페이지
│       │           ├── board/list.html          ← 게시판 목록 페이지
│       │           ├── schedule/list.html       ← 일정 목록 페이지
│       │           ├── department/index.html    ← 학과정보 페이지
│       │           └── auth/login.html          ← 로그인 페이지
│       │
│       └── test/java/com/example/demo/
│           ├── DemoApplicationTests.java        ← 전체 앱 통합 테스트 (DB 필요)
│           └── controller/                      ← 컨트롤러 슬라이스 테스트 (DB 불필요)
│               ├── MainControllerTest.java
│               ├── NoticeControllerTest.java
│               ├── BoardControllerTest.java
│               ├── ScheduleControllerTest.java
│               ├── DepartmentControllerTest.java
│               └── AuthControllerTest.java
│
├── docs/superpowers/                   ← 개발 문서 (설계 스펙, 구현 계획)
│   ├── specs/                          ← 페이지별 디자인 명세서
│   └── plans/                          ← 구현 계획서
│
├── PROMPTS.md                          ← 세션 간 컨텍스트 유지용 프롬프트 기록
├── PROJECT_GUIDE.md                    ← 이 파일
├── db-config-template.txt             ← Oracle DB 연결 설정 가이드 (민감정보 제외)
└── README.md                           ← 기본 리드미
```

---

## 4. URL 라우팅 구조

| URL | 컨트롤러 | 렌더링 템플릿 | 설명 |
|-----|---------|--------------|------|
| `GET /` | MainController | `main/index.html` | 메인 대시보드 |
| `GET /notice` | NoticeController | `notice/list.html` | 공지사항 목록 |
| `GET /board` | BoardController | `board/list.html` | 게시판 목록 |
| `GET /schedule` | ScheduleController | `schedule/list.html` | 일정 목록 |
| `GET /department` | DepartmentController | `department/index.html` | 학과정보 |
| `GET /login` | AuthController | `auth/login.html` | 로그인 폼 |

모든 컨트롤러는 `@Controller` + `@GetMapping`으로 선언된 Spring MVC 방식입니다. 컨트롤러가 Model에 데이터를 담아 반환하면 Thymeleaf가 해당 HTML 파일에 데이터를 주입해 완성된 페이지를 브라우저로 전송합니다.

---

## 5. 데이터 모델 (DTO)

DTO(Data Transfer Object)는 컨트롤러에서 템플릿으로 데이터를 전달하는 불변 객체입니다. 모든 필드는 `final`로 선언되어 있으며, DB 연동 전에는 컨트롤러에서 하드코딩된 더미 데이터로 생성합니다.

### NoticeDto (공지사항)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 고유 식별자 |
| title | String | 공지 제목 |
| date | String | 작성일 (yyyy-MM-dd) |
| author | String | 작성자 |
| category | String | 카테고리 (학사·장학·행사·취업) |
| viewCount | int | 조회수 |
| featured | boolean | 긴급/대표 공지 여부 |

### PostDto (게시글)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 고유 식별자 |
| title | String | 게시글 제목 |
| author | String | 작성자 |
| likes | int | 좋아요 수 |
| category | String | 카테고리 (자유게시판·질문·스터디·취업후기) |
| viewCount | int | 조회수 |
| date | String | 작성일 (yyyy-MM-dd) |
| featured | boolean | 대표 게시글 여부 |

### ScheduleDto (일정)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | Long | 고유 식별자 |
| title | String | 일정 이름 |
| date | String | 일정 날짜 (yyyy-MM-dd) |
| dday | int | D-Day 값 (오늘 기준 남은 일수) |
| category | String | 카테고리 (학사·행사·시험·기타) |

---

## 6. 각 컨트롤러와 모델 변수

### MainController (`GET /`)
메인 페이지에 3가지 섹션용 더미 데이터를 제공합니다.

| 모델 변수 | 타입 | 설명 |
|-----------|------|------|
| notices | List\<NoticeDto\> | 최신 공지사항 5개 |
| posts | List\<PostDto\> | 인기 게시글 5개 (좋아요 순) |
| schedules | List\<ScheduleDto\> | 다가오는 일정 5개 |
| today | String | 오늘 날짜 (한국어 형식, 예: 2026년 05월 11일 월요일) |
| currentPage | String | "main" |

### NoticeController (`GET /notice`)

| 모델 변수 | 타입 | 설명 |
|-----------|------|------|
| featured | NoticeDto | 대표(긴급) 공지 1건 |
| notices | List\<NoticeDto\> | 공지 목록 (9개) |
| currentPage | String | "notice" |

### BoardController (`GET /board`)

| 모델 변수 | 타입 | 설명 |
|-----------|------|------|
| featured | PostDto | 대표 게시글 1건 |
| posts | List\<PostDto\> | 게시글 목록 (9개, 카테고리 혼합) |
| currentPage | String | "board" |

### ScheduleController (`GET /schedule`)

| 모델 변수 | 타입 | 설명 |
|-----------|------|------|
| schedules | List\<ScheduleDto\> | 일정 목록 (12개, 5~6월, dday 오름차순) |
| currentPage | String | "schedule" |

### DepartmentController (`GET /department`)

| 모델 변수 | 타입 | 설명 |
|-----------|------|------|
| currentPage | String | "department" |

학과정보 페이지는 모든 콘텐츠가 HTML에 하드코딩된 정적 더미 데이터입니다.

### AuthController (`GET /login`)

| 모델 변수 | 타입 | 설명 |
|-----------|------|------|
| currentPage | String | "login" |

---

## 7. 구현된 기능 상세

### 7-1. 공통 — 고정 네비게이션 바
- 모든 페이지 상단에 `position: fixed`로 고정
- 검정 배경(`bg-black`), 흰색 텍스트
- 왼쪽: 사이트 로고 (클릭 시 메인으로 이동)
- 가운데: 공지사항 / 게시판 / 일정 / 학과정보 링크
- 현재 페이지에 해당하는 링크 아래에 흰색 언더라인 표시
- 오른쪽: 검색 입력창 + 로그인 버튼
- 모바일(768px 미만): 햄버거 버튼으로 전체 너비 드롭다운 메뉴 전환

### 7-2. 메인 페이지 (`/`)
- **히어로 섹션:** 검정 배경, 학과명, 오늘 날짜 표시. D-Day가 14일 이하인 일정은 흰색 테두리 배지로 표시.
- **3열 카드 그리드:** 데스크탑에서 공지사항·인기게시글·일정을 나란히 표시 (모바일에서 세로 1열).
  - 각 카드: 검정 헤더 + 아이콘 + 목록 + "더보기 →" 링크
- **빠른 바로가기:** 4개 아이콘 버튼 (공지사항·게시판·일정·학과정보). 호버 시 검정 배경으로 전환.

### 7-3. 공지사항 페이지 (`/notice`)
- **대표 공지(Featured):** 전체 너비 이미지 플레이스홀더 + 하단 그라디언트 위에 제목·카테고리·날짜·조회수 오버레이.
- **카테고리 필터 탭:** 전체 / 학사 / 장학 / 행사 / 취업. 클릭 시 JS가 해당 카테고리 항목만 표시.
- **2단 레이아웃 (데스크탑):**
  - 왼쪽: 공지 목록 (썸네일 플레이스홀더 + 제목 + 카테고리 배지 + 날짜 + 조회수) + 더미 페이지네이션
  - 오른쪽 사이드바: 카테고리별 글 수 위젯 + 최근 공지 5건 위젯
- **모바일:** 단일 열, 사이드바가 목록 아래로 이동.

### 7-4. 게시판 페이지 (`/board`)
공지사항 페이지와 동일한 레이아웃 구조.
- **대표 게시글(Featured):** 이미지 플레이스홀더 + 카테고리·제목·좋아요 수 오버레이.
- **카테고리 필터 탭:** 전체 / 자유게시판 / 질문 / 스터디 / 취업후기.
- **2단 레이아웃 (데스크탑):**
  - 왼쪽: 게시글 목록 (썸네일 + 제목 + 카테고리 배지 + 날짜 + 좋아요 수 + 조회수) + 더미 페이지네이션
  - 오른쪽 사이드바: 카테고리별 글 수 위젯 + 인기 게시글 TOP 5 위젯 (좋아요 기준)

### 7-5. 일정 페이지 (`/schedule`)
- **카테고리 필터 탭:** 전체 / 학사 / 행사 / 시험 / 기타.
- **월별 자동 그룹화:** 페이지 로드 시 JavaScript(`groupByMonth()`)가 일정 항목들 사이에 "▶ 2026년 5월" 형태의 월 헤더를 자동으로 삽입. 카테고리 필터 적용 시 해당 월에 표시 항목이 없으면 월 헤더도 함께 숨김.
- **일정 행:** 날짜 블록 (일/월) + 일정 제목 + D-Day 배지 (검정 배경) + 카테고리 배지.
- **2단 레이아웃 (데스크탑):**
  - 왼쪽: 월별 그룹화된 일정 목록
  - 오른쪽 사이드바: 이번 달 카테고리별 일정 수 + D-Day 임박 TOP 5 (dday 오름차순 상위 5개)

### 7-6. 학과정보 페이지 (`/department`)
4개 섹션이 세로로 순차 배치. 별도의 필터나 JS 없는 정적 페이지.
1. **학과 소개:** 텍스트 2단락 + 이미지 플레이스홀더 (데스크탑에서 좌우 배치).
2. **교수진:** 3열 카드 그리드 (6명). 각 카드: 아바타 플레이스홀더 + 이름 + 전공 + 이메일.
3. **교육과정:** 표 (과목명 / 학년 / 구분(필수·선택) / 학점). 8개 과목.
4. **위치 및 연락정보:** 지도 플레이스홀더 + 주소·전화·이메일·운영시간 텍스트.

### 7-7. 로그인 페이지 (`/login`)
- 화면 전체 높이 중앙 정렬 (`min-h-screen flex items-center justify-center`).
- 흰색 배경 카드 (2px 검정 테두리, `max-w-sm`).
- 사이트 제목 → 구분선 → 아이디 입력 → 비밀번호 입력 → 로그인 버튼 (검정 배경).
- 하단 링크: 회원가입 | 비밀번호 찾기 (현재 더미 URL).

---

## 8. 프론트엔드 설계 원칙

**디자인 시스템:** B&W(흑백) 미니멀리즘.
- 배경: 흰색(`#ffffff`), 텍스트: 검정(`#000000`)
- 강조 색상 없음. 모든 버튼·배지·테두리는 검정/흰색만 사용.
- 유일한 예외: 좋아요 아이콘에 연한 빨간색(`text-red-400`).

**CSS 전략:**
- Tailwind CSS CDN을 통해 유틸리티 클래스로 모든 스타일 적용.
- `custom.css`와 Bootstrap은 `layout/base.html`(레거시)에 남아 있으나, 현재 모든 활성 페이지는 Tailwind만 사용.
- 활성 필터 탭 스타일(`active-tab`)은 각 페이지의 `<style>` 태그에 정의.

**반응형:**
- 데스크탑(lg: 1024px 이상): 2단 또는 3단 레이아웃
- 모바일(lg 미만): 단일 열, 사이드바가 아래로 이동

---

## 9. 테스트 구조

컨트롤러 테스트는 `@WebMvcTest`를 사용합니다. 이 어노테이션은 DB 연결 없이 컨트롤러 레이어만 격리해서 테스트하므로 Oracle DB가 없어도 실행됩니다.

| 테스트 파일 | 테스트 수 | 검증 내용 |
|------------|----------|----------|
| MainControllerTest | 1 | GET / → 200 OK, main/index 뷰, currentPage 속성 |
| NoticeControllerTest | 2 | GET /notice → 200 OK, notices + featured 속성 존재 |
| BoardControllerTest | 3 | GET /board → 200 OK, posts + featured 속성 존재 |
| ScheduleControllerTest | 2 | GET /schedule → 200 OK, schedules 속성 존재 |
| DepartmentControllerTest | 1 | GET /department → 200 OK, department/index 뷰 |
| AuthControllerTest | 1 | GET /login → 200 OK, auth/login 뷰 |
| **합계** | **10** | |

**테스트 실행 명령:**
```
cd demo/demo
./mvnw test -Dtest="MainControllerTest,NoticeControllerTest,BoardControllerTest,ScheduleControllerTest,DepartmentControllerTest,AuthControllerTest"
```

`DemoApplicationTests`는 전체 통합 테스트로 Oracle DB 연결이 필요합니다.

---

## 10. 앱 실행 방법

### 로컬 개발 (DB 없이 UI만 확인)

`application.properties`에 이미 DB 자동설정이 비활성화되어 있으므로 DB 없이 바로 실행 가능합니다.

```bash
cd demo/demo
./mvnw spring-boot:run
```

브라우저에서 `http://localhost:8080` 접속.

### DB 연동 (팀원 작업 시)

1. `db-config-template.txt`를 참고하여 `demo/demo/src/main/resources/application-secret.properties` 파일 생성
2. Oracle DB 접속 정보 입력 (팀 채널에서 공유)
3. `application.properties`에서 `spring.autoconfigure.exclude` 3줄 제거
4. 앱 재시작

**주의:** `application-secret.properties`는 `.gitignore`에 등록되어 있어 Git에 절대 올라가지 않습니다.

---

## 11. 팀원 작업 가이드 (TODO 목록)

각 파일에 `TODO: [팀원-담당명]` 형태의 주석으로 작업 위치를 표시해 두었습니다.

| 담당 영역 | 수정 파일 | 주요 작업 |
|----------|----------|----------|
| 공지사항 | `NoticeController.java` | noticeService 주입 후 더미 데이터 → DB 조회로 교체 |
| 공지사항 | `notice/list.html` | 링크 URL `/notice/{id}` 형태로 수정, 실제 이미지 삽입 |
| 게시판 | `BoardController.java` | postService 주입 후 더미 데이터 → DB 조회로 교체 |
| 게시판 | `board/list.html` | 링크 URL, 실제 이미지, 작성 폼 연결 |
| 일정 | `ScheduleController.java` | scheduleService 주입 후 더미 데이터 → DB 조회로 교체 |
| 일정 | `schedule/list.html` | 실제 dday 계산 로직 연동 |
| 학과정보 | `department/index.html` | 실제 교수 정보, 지도 API(카카오/네이버) 연동 |
| 인증 | `AuthController.java` | Spring Security + POST /login 처리 로직 구현 |
| 인증 | `auth/login.html` | th:action, CSRF 토큰, 오류 메시지 추가 |
| 공통 | `ScheduleDto.java` | 실제 연동 시 dday 계산을 서비스에서 처리 (`ChronoUnit.DAYS.between`) |
| 페이지네이션 | 각 list.html | 더미 페이지네이션 → 실제 페이지 파라미터(`?page=N`) 연동 |

---

## 12. 파일별 역할 한 줄 요약

| 파일 | 역할 |
|------|------|
| `DemoApplication.java` | Spring Boot 앱 시작점 (`@SpringBootApplication`) |
| `MainController.java` | 메인 페이지 렌더링, 공지·게시글·일정 더미 데이터 제공 |
| `NoticeController.java` | 공지사항 목록 렌더링, featured + notices 더미 데이터 제공 |
| `BoardController.java` | 게시판 목록 렌더링, featured + posts 더미 데이터 제공 |
| `ScheduleController.java` | 일정 목록 렌더링, schedules 더미 데이터 제공 |
| `DepartmentController.java` | 학과정보 페이지 렌더링 (데이터 없음, 정적 HTML) |
| `AuthController.java` | 로그인 폼 렌더링 |
| `NoticeDto.java` | 공지사항 데이터 구조 정의 (7개 필드) |
| `PostDto.java` | 게시글 데이터 구조 정의 (8개 필드) |
| `ScheduleDto.java` | 일정 데이터 구조 정의 (5개 필드) |
| `main/index.html` | 메인 대시보드 UI (히어로·3열 카드·바로가기) |
| `notice/list.html` | 공지사항 목록 UI (featured·필터·2단·사이드바) |
| `board/list.html` | 게시판 목록 UI (featured·필터·2단·사이드바) |
| `schedule/list.html` | 일정 목록 UI (월별 그룹·필터·D-Day 사이드바) |
| `department/index.html` | 학과정보 UI (4개 섹션 정적 페이지) |
| `auth/login.html` | 로그인 폼 UI (중앙 정렬 카드) |
| `layout/base.html` | 레거시 공통 navbar/footer fragment (현재 미사용) |
| `application.properties` | 서버 포트, Thymeleaf 캐시 설정, DB 자동설정 비활성화 |
| `application-secret.properties` | Oracle DB 접속 정보 (Git 미포함, 각자 로컬에서 생성) |
| `db-config-template.txt` | DB 연결 설정 작성 방법 안내서 |
| `pom.xml` | Maven 의존성 및 빌드 플러그인 정의 |
