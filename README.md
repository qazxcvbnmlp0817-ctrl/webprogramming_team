# 학과 포털 — Department Info Integration Site

학과·학부·대학 정보를 한 곳에서 확인할 수 있는 통합 포털 웹 애플리케이션입니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | Spring Boot 4.0.6, Java 17, Maven |
| Database | Oracle 23ai Free (로컬, `freepdb1`) |
| ORM | Spring Data JPA / Hibernate (`ddl-auto=update`) |
| 암호화 | spring-security-crypto (BCryptPasswordEncoder) |
| Frontend | Vite 8 + React 18 + TypeScript 5 |
| 스타일 | Tailwind CSS 3 |
| 라우팅 | react-router-dom 6 |

---

## 프로젝트 구조

```
webprogramming_team-main/
├── frontend/                        # React SPA (Vite)
│   └── src/
│       ├── App.tsx                  # 라우터 정의
│       ├── context/DeptContext.tsx  # 전역 학과 선택 상태
│       ├── api/                     # fetch 함수 모음
│       │   ├── auth.ts
│       │   ├── notices.ts
│       │   ├── posts.ts
│       │   ├── schedules.ts
│       │   └── universities.ts
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── Footer.tsx
│       │   ├── FilterTabs.tsx
│       │   ├── FeaturedCard.tsx
│       │   ├── MiniCalendar.tsx
│       │   ├── Sidebar.tsx
│       │   └── Pagination.tsx
│       └── pages/
│           ├── UniversityListPage.tsx      # 대학 목록
│           ├── UniversityShowPage.tsx      # 단과대학 목록
│           ├── SchoolDepartmentsPage.tsx   # 학교 학과 목록
│           ├── FacultyPage.tsx             # 학부 메인
│           ├── MainPage.tsx                # 학과 메인
│           ├── NoticePage.tsx              # 학과 공지
│           ├── NoticeWritePage.tsx         # 학과 공지 작성
│           ├── BoardPage.tsx               # 학과 게시판
│           ├── WritePostPage.tsx           # 학과 게시글 작성
│           ├── SchedulePage.tsx            # 학과 일정
│           ├── DepartmentPage.tsx          # 학과 정보
│           ├── FacultyNoticePage.tsx       # 학부 공지
│           ├── FacultyNoticeWritePage.tsx  # 학부 공지 작성
│           ├── FacultyBoardPage.tsx        # 학부 게시판
│           ├── FacultySchedulePage.tsx     # 학부 일정
│           ├── SchoolNoticePage.tsx        # 단과대 공지
│           ├── SchoolNoticeWritePage.tsx   # 단과대 공지 작성
│           ├── SchoolBoardPage.tsx         # 단과대 게시판
│           ├── SchoolWritePostPage.tsx     # 단과대 게시글 작성
│           ├── SchoolSchedulePage.tsx      # 단과대 일정
│           ├── SchoolInfoPage.tsx          # 단과대 정보
│           ├── LoginPage.tsx               # 로그인
│           ├── SignupPage.tsx              # 회원가입 (6단계)
│           ├── MyPage.tsx                  # 마이페이지
│           ├── FindIdPage.tsx              # 아이디 찾기
│           ├── FindPasswordPage.tsx        # 비밀번호 찾기
│           └── admin/
│               ├── SuperAdminPage.tsx      # 최고 관리자 대시보드 + 가입 승인 + 역할 부여
│               ├── SchoolAdminPage.tsx     # 학교 관리자 6탭 대시보드
│               ├── DeptAdminPage.tsx       # 학과 관리자 6탭 + 학과 페이지 임베드
│               └── FacultyAdminPage.tsx    # 학부 관리자 6탭 + 학부 페이지 임베드
│
└── demo/demo/                       # Spring Boot
    └── src/main/java/com/example/demo/
        ├── entity/                  # JPA 엔티티
        │   ├── User.java            → APP_USERS   (status, adminRole 포함)
        │   ├── Notice.java          → NOTICES
        │   ├── Post.java            → POSTS
        │   ├── Schedule.java        → SCHEDULES
        │   ├── University.java      → UNIVERSITIES
        │   ├── CollegeSchool.java   → COLLEGE_SCHOOLS
        │   ├── FacultyGroup.java    → FACULTY_GROUPS
        │   ├── Department.java      → DEPTS
        │   ├── Professor.java       → PROFESSORS
        │   ├── CurriculumItem.java  → CURRICULUM_ITEMS
        │   ├── PageVisit.java       → PAGE_VISITS (방문자 추적)
        │   └── AdminLog.java        → ADMIN_LOGS  (관리자 액션 로그)
        ├── repository/              # Spring Data JPA
        ├── service/
        │   ├── AuthService.java     # 로그인·회원가입·아이디/비번 찾기
        │   ├── AdminService.java    # 어드민 대시보드 통계/사용자/승인 로직
        │   ├── NoticeService.java
        │   ├── PostService.java
        │   ├── ScheduleService.java
        │   └── UniversityService.java
        ├── controller/
        │   ├── AuthController.java
        │   ├── NoticeController.java
        │   ├── BoardController.java
        │   ├── ScheduleController.java
        │   ├── MainController.java
        │   ├── SchoolController.java
        │   ├── UniversityController.java
        │   ├── DepartmentController.java
        │   ├── SuperAdminController.java    # /api/admin/super/*
        │   ├── SchoolAdminController.java   # /api/admin/school/*
        │   ├── DeptAdminController.java     # /api/admin/dept/*
        │   ├── FacultyAdminController.java  # /api/admin/faculty/*
        │   └── SpaController.java   # React SPA 폴백
        ├── dto/                     # 요청/응답 DTO
        └── util/
            ├── DataInitializer.java        # 최초 실행 시 시드 데이터 삽입
            ├── AdminUserInitializer.java   # SUPER_ADMIN 시드 계정 생성
            ├── StatusMigrationRunner.java  # APPROVED → STATUS 컬럼 마이그레이션
            └── DummyDataHelper.java        # DB 비어 있을 때 폴백 더미 데이터
```

---

## DB 테이블 구조

```
UNIVERSITIES (대학)
  └── COLLEGE_SCHOOLS (단과대학)
        └── FACULTY_GROUPS (학부)
              └── DEPTS (학과)
                    ├── PROFESSORS (교수)
                    └── CURRICULUM_ITEMS (교육과정)

APP_USERS (회원)
NOTICES   (공지사항) — scopeType: dept | faculty | univ
POSTS     (게시글)   — scopeType: dept | faculty | univ
SCHEDULES (일정)     — scopeType: dept | faculty | univ
```

### 시드 데이터 (DataInitializer)

최초 실행 시 UNIVERSITIES 테이블이 비어 있으면 자동 삽입됩니다.

| 대학 | 단과대학 | 학부 | 학과 |
|------|---------|------|------|
| 목포대학교 | 6개 | 7개 | 18개 |
| 순천대학교 | 2개 | 2개 | 4개 |

각 학과마다 교수 3명 + 교육과정 6개 자동 생성.

---

## REST API 목록

### 인증 (`/api/auth`)
| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/signup` | 회원가입 |
| GET | `/api/auth/check-id?username=` | 아이디 중복 확인 |
| POST | `/api/auth/find-id` | 아이디 찾기 |
| POST | `/api/auth/find-password` | 비밀번호 찾기 (임시 비번 발급) |

### 대학 구조
| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/universities` | 전체 대학 목록 (계층 포함) |
| GET | `/api/universities/{id}` | 특정 대학 상세 |
| GET | `/api/departments/{id}` | 학과 상세 (교수·교육과정 포함) |

### 학과 (dept)
| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/main?deptId=` | 학과 메인 (공지·게시글·일정 요약) |
| GET | `/api/notices?deptId=` | 학과 공지 목록 |
| POST | `/api/notices` | 학과 공지 작성 |
| GET | `/api/posts?deptId=` | 학과 게시글 목록 |
| POST | `/api/posts` | 학과 게시글 작성 |
| GET | `/api/schedules?deptId=` | 학과 일정 |

### 학부 (faculty)
| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/faculty/main?facultyId=` | 학부 메인 요약 |
| GET | `/api/faculty/notices?facultyId=` | 학부 공지 |
| POST | `/api/faculty/notices` | 학부 공지 작성 |
| GET | `/api/faculty/posts?facultyId=` | 학부 게시글 |
| POST | `/api/faculty/posts` | 학부 게시글 작성 |
| GET | `/api/faculty/schedules?facultyId=` | 학부 일정 |

### 단과대학 (school)
| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/school/notices?schoolId=` | 단과대 공지 |
| POST | `/api/univ/notices` | 단과대 공지 작성 |
| GET | `/api/school/posts?schoolId=` | 단과대 게시글 |
| POST | `/api/univ/posts` | 단과대 게시글 작성 |
| GET | `/api/school/schedules?schoolId=` | 단과대 일정 |
| GET | `/api/school/info?schoolId=` | 단과대 정보 |

### 관리자 API

모든 어드민 엔드포인트는 `X-Username` 요청 헤더로 사용자를 식별하고 백엔드에서 `adminRole` 가드를 통과해야 호출 가능합니다 (실패 시 403).

**최고 관리자 (`SUPER_ADMIN` 전용)** — `/api/admin/super/*`
| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/admin/super/stats` | 전체 사용자/학교/방문자 통계 |
| GET | `/api/admin/super/schools` | 등록 학교 목록 |
| GET | `/api/admin/super/visitors` | 30일 방문자 추이 |
| GET | `/api/admin/super/infra` | 서버 메모리/스레드/업타임 |
| GET | `/api/admin/super/users` | 관리자 역할 보유 사용자 |
| PUT | `/api/admin/super/users/{id}/role` | 사용자 역할 부여/회수 |
| GET | `/api/admin/super/pending-admins` | 관리자 가입 승인 대기 목록 |
| PUT | `/api/admin/super/users/{id}/approve-admin` | 가입 승인/거절 + 역할 부여 |
| PUT | `/api/admin/super/users/{id}/approve` | (구) 일반 승인 토글 |

**학교 관리자 (`SCHOOL_ADMIN` + `SUPER_ADMIN`)** — `/api/admin/school/*`
- SUPER_ADMIN은 `?univId=X` 쿼리로 학교 지정, SCHOOL_ADMIN은 본인 학교 자동 해석
- `/stats`, `/visitors` (단/학부/학과 통합 집계), `/posts`, `/notices`, `/users`, `/all-users`, `/pending-users` (admin 신청 제외), `/users/{id}/status`, `/users/{id}/role`, `/logs`, `/monthly-stats`

**학과 관리자 (`SUPER` + `SCHOOL` + `DEPT_ADMIN`)** — `/api/admin/dept/*`
- SUPER/SCHOOL은 `?deptId=X` 쿼리로 지정, DEPT_ADMIN은 본인 학과 자동 해석
- `/stats`, `/visitors`, `/posts`, `/notices`, `/users`, `/users/{id}/status`, `/monthly-stats`

**학부 관리자 (`SUPER` + `SCHOOL` 전용, DEPT_ADMIN 차단)** — `/api/admin/faculty/*`
- `?facultyId=X` 쿼리 필수
- 동일한 9개 엔드포인트 셋

---

## 실행 방법

### 사전 조건
- Java 17
- Oracle 23ai Free 로컬 설치 및 `dept_user` 계정 설정
- Node.js 18+

### 1. DB 설정

Oracle SQL*Plus 또는 SQL Developer에서 실행:
```sql
CREATE USER dept_user IDENTIFIED BY dept1234;
GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, UNLIMITED TABLESPACE TO dept_user;
```

### 2. 시크릿 설정 파일 생성 (git에 절대 커밋 금지)

`demo/demo/src/main/resources/application-secret.properties` 파일 생성:
```properties
spring.datasource.url=jdbc:oracle:thin:@//localhost:1521/freepdb1
spring.datasource.username=dept_user
spring.datasource.password=dept1234
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### 3. 프론트엔드 빌드

```bash
cd frontend
npm install
npm run build
```

빌드 결과물은 자동으로 `demo/demo/src/main/resources/static/`에 배포됩니다.

### 4. Spring Boot 실행

```bash
cd demo/demo
./mvnw spring-boot:run
```

→ `http://localhost:8080` 접속

---

## 주요 구현 사항

- **BCrypt 암호화**: 회원가입 시 비밀번호 BCrypt 해시 저장, 로그인 시 검증
- **회원 유형**: `student`(학생) / `professor`(교수) / `staff`(직원) / `admin`(관리자)
- **사용자 상태 (`APP_USERS.STATUS`)**: `ACTIVE` / `PENDING_APPROVAL` / `SUSPENDED` / `DELETED`
- **관리자 역할 (`APP_USERS.ADMIN_ROLE`)**: `SUPER_ADMIN` (전 시스템) / `SCHOOL_ADMIN` (자기 학교) / `DEPT_ADMIN` (자기 학과)
- **관리자 가입 흐름**: `memberType=admin`으로 가입 시 `status=PENDING_APPROVAL`, `adminRole=null`. SUPER_ADMIN이 SuperAdminPage에서 역할 선택 후 승인 시 ACTIVE + 역할 부여.
- **공개 범위**: 게시글 작성 시 `all`(전체) / `student`(학생만) / `professor`(교수만) 선택 가능
- **학년 필터**: 학생 게시글에 대상 학년(1~4학년) 태그 설정 가능
- **AdminBanner**: 일반 페이지에 떠 있는 "관리자 페이지" 진입 버튼. 역할별로 다른 어드민 대시보드로 라우팅
- **임베디드 모드**: `<DepartmentPage embedded />` / `<FacultyPage embedded />`로 어드민 대시보드의 "학과/학부 페이지" 탭 안에 일반 페이지를 표시 (Navbar/AdminBanner 숨김)
- **DummyDataHelper**: DB에 공지·게시글·일정이 없을 경우 더미 데이터로 폴백
- **SPA 라우팅**: SpaController가 모든 프론트엔드 경로를 `index.html`로 포워딩

---

## 주의사항

- `application-secret.properties`는 `.gitignore`에 등록되어 있으며 **절대 커밋하면 안 됩니다.**
- 테이블은 `ddl-auto=update`로 자동 생성·수정됩니다. Oracle `freepdb1` PDB가 실행 중이어야 합니다.
