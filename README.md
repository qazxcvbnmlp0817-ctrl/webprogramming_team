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
│       │   ├── universities.ts
│       │   ├── classSchedules.ts    # 학생 수업 시간표 조회 (ClassScheduleDto + fetchStudentClassSchedules)
│       │   └── adminSuper.ts        # SUPER_ADMIN API (학교 목록·트리·CRUD 포함)
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
│           ├── CalendarPage.tsx            # 개인 캘린더 (/calendar, 로그인 전용 — 학생은 수업 시간표 자동 동기화)
│           ├── FindIdPage.tsx              # 아이디 찾기
│           ├── FindPasswordPage.tsx        # 비밀번호 찾기
│           └── admin/
│               ├── SuperAdminPage.tsx      # 최고 관리자 대시보드 (개요·학교 관리 2탭)
│               ├── SchoolManagementTab.tsx # 학교 CRUD 탭 (목록·생성·편집 뷰)
│               ├── SchoolTreeEditor.tsx    # 단과대학→학부→학과 계층 편집 컴포넌트
│               ├── SchoolAdminPage.tsx     # 학교 관리자 6탭 대시보드
│               ├── DeptAdminPage.tsx       # 학과 관리자 6탭 + 학과 페이지 임베드
│               └── FacultyAdminPage.tsx    # 학부 관리자 6탭 + 학부 페이지 임베드
│
└── demo/demo/                       # Spring Boot
    └── src/main/java/com/example/demo/
        ├── entity/                  # JPA 엔티티
        │   ├── User.java            → APP_USERS   (status, adminRole, professorEntityId 포함)
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
        │   ├── AdminLog.java        → ADMIN_LOGS  (관리자 액션 로그)
        │   ├── ClassSchedule.java   → CLASS_SCHEDULES (교수 수업 시간표)
        │   ├── Enrollment.java      → ENROLLMENTS (학생 수강신청)
        │   └── ProfessorCourseAssignment.java → PROF_COURSE_ASSIGNMENTS (교수-강좌 배정)
        ├── repository/              # Spring Data JPA
        ├── service/
        │   ├── AuthService.java              # 로그인·회원가입·아이디/비번 찾기
        │   ├── AdminService.java             # 어드민 대시보드 통계/사용자/승인 로직
        │   ├── SchoolCrudService.java        # 학교 계층 CRUD (getTree/create/update/cascade delete)
        │   ├── ProfessorScheduleService.java # 교수 시간표 CRUD + 학생 시간표 조회 + 수강신청
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
        │   ├── ProfessorScheduleController.java  # /api/professor/* (교수 전용)
        │   ├── StudentScheduleController.java    # /api/student/*  (학생 전용)
        │   ├── SuperAdminController.java         # /api/admin/super/*
        │   ├── SchoolAdminController.java        # /api/admin/school/*
        │   ├── DeptAdminController.java          # /api/admin/dept/*
        │   ├── FacultyAdminController.java       # /api/admin/faculty/*
        │   └── SpaController.java               # React SPA 폴백
        ├── dto/                     # 요청/응답 DTO
        │   ├── SchoolTreeDto.java           # 학교 계층 트리 요청/응답 DTO (CollegeDto·FacultyDto·DeptDto 내부 클래스)
        │   ├── ClassScheduleDto.java        # 수업 시간표 응답 DTO
        │   └── ClassScheduleRequestDto.java # 수업 시간표 생성/수정 요청 DTO
        └── util/
            ├── DataInitializer.java           # 최초 실행 시 시드 + 교수명 마이그레이션 (@Order(4))
            ├── AdminUserInitializer.java      # SUPER_ADMIN 시드 계정 생성
            ├── ProfessorAccountInitializer.java # 교수/학생 Mock 계정 + 수강신청 + 시간표 시딩 (@Order(5))
            ├── StatusMigrationRunner.java     # APPROVED → STATUS 컬럼 마이그레이션
            ├── GradeStatusMigrationRunner.java # 학년/재학상태 마이그레이션
            └── LectureOfferingClassScheduleSyncInitializer.java # 강의-수업 동기화
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
                          └── PROF_COURSE_ASSIGNMENTS (교수-강좌 배정)
                                └── CLASS_SCHEDULES (수업 시간표)

APP_USERS (회원)         — professorEntityId 컬럼으로 PROFESSORS 연결
ENROLLMENTS (수강신청)   — studentUsername + courseId + semester (unique)
NOTICES   (공지사항)     — scopeType: dept | faculty | univ
POSTS     (게시글)       — scopeType: dept | faculty | univ
SCHEDULES (일정)         — scopeType: dept | faculty | univ
```

### 시드 데이터 (DataInitializer + ProfessorAccountInitializer)

최초 실행 시 UNIVERSITIES 테이블이 비어 있으면 자동 삽입됩니다. 재실행 시 교수명이 모두 동일하면 자동 마이그레이션합니다.

| 대학 | 단과대학 | 학부 | 학과 |
|------|---------|------|------|
| 목포대학교 | 6개 | 7개 | 18개 |
| 순천대학교 | 2개 | 2개 | 4개 |

각 학과마다 교수 3명 + 교육과정 6개 자동 생성.

### Mock 계정 (ProfessorAccountInitializer — 목포대학교 기준)

**교수 계정** (password: `prof1234`)

| username | 이름 | 학과 | 담당 강좌 |
|----------|------|------|----------|
| prof_kim | 김민준 | 컴퓨터공학과 | 컴퓨터공학과 개론 |
| prof_lee | 이서준 | 컴퓨터공학과 | 전공기초 실습 |
| prof_park | 박지호 | 컴퓨터공학과 | 심화 이론 |
| prof_choi | 최예준 | 전기전자공학과 | 전기전자공학과 개론 |
| prof_jung | 정시우 | 정보통신공학과 | 정보통신공학과 개론 |

**학생 계정** (password: `stu1234`)

| username | 이름 | 학과 | 학년 | 수강신청 강좌 |
|----------|------|------|------|--------------|
| stu_kim1 | 김학생 | 컴퓨터공학과 | 1 | 컴퓨터공학과 개론, 전공기초 실습 |
| stu_lee2 | 이학생 | 컴퓨터공학과 | 2 | 심화 이론 |
| stu_park1 | 박학생 | 전기전자공학과 | 1 | 전기전자공학과 개론 |

---

## REST API 목록

### 인증 (`/api/auth`)
| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/signup` | 회원가입 |
| GET | `/api/auth/check-id?username=` | 아이디 중복 확인 |
| POST | `/api/auth/find-id` | 아이디 찾기 (name, universityId, college, studentId) |
| POST | `/api/auth/find-password` | 비밀번호 찾기 — 임시 비번 발급 (username, name, universityId, college, studentId) |
| POST | `/api/auth/change-password` | 비밀번호 변경 (currentPassword, newPassword) |

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
| GET | `/api/faculty/schedules?facultyId=` | 학부 일정 (MainPage 소속 일정 통합용) |
| GET | `/api/univ/schedules?univId=` | 학교 일정 (MainPage 소속 일정 통합용) |
| GET | `/api/student/dept-events?deptId=` | 교수 등록 학과 전체 이벤트 (시험·과제 등) |
| POST | `/api/professor/dept-schedules` | 교수 학과 전체 공개 이벤트 등록 (Header: X-Username) |

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

### 교수 시간표 (`/api/professor`) — `X-Username` 헤더 필수, professor 계정 전용

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/professor/class-schedules` | 내 수업 시간표 전체 조회 |
| GET | `/api/professor/class-schedules?semester=2025-1` | 학기별 수업 시간표 조회 |
| POST | `/api/professor/class-schedules` | 수업 시간표 등록 |
| PUT | `/api/professor/class-schedules/{id}` | 수업 시간표 수정 (수강생에 즉시 반영) |
| DELETE | `/api/professor/class-schedules/{id}` | 수업 시간표 삭제 (수강생에서 즉시 제거) |

### 학생 시간표 (`/api/student`) — `X-Username` 헤더 필수

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/student/class-schedules?semester=2025-1` | 수강신청 기반 내 시간표 조회 |
| GET | `/api/student/enrollments?semester=2025-1` | 수강신청 목록 조회 |
| POST | `/api/student/enrollments` | 수강신청 (body: `{courseId, semester}`) |
| DELETE | `/api/student/enrollments/{enrollmentId}` | 수강신청 취소 |

### 관리자 API

모든 어드민 엔드포인트는 `X-Username` 요청 헤더로 사용자를 식별하고 백엔드에서 `adminRole` 가드를 통과해야 호출 가능합니다 (실패 시 403).

**최고 관리자 (`SUPER_ADMIN` 전용)** — `/api/admin/super/*`
| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/admin/super/stats` | 전체 사용자/학교/방문자 통계 |
| GET | `/api/admin/super/schools` | 등록 학교 목록 (id, name, description) |
| GET | `/api/admin/super/schools/{id}/tree` | 특정 학교 전체 트리 조회 (수정 폼 초기화용) |
| POST | `/api/admin/super/schools` | 학교 + 전체 계층 일괄 생성 (all-or-nothing) |
| PUT | `/api/admin/super/schools/{id}` | 학교 + 전체 계층 Merge 수정 |
| DELETE | `/api/admin/super/schools/{id}` | 학교 + 모든 하위 데이터 cascade 삭제 |
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
- `/stats`, `/visitors`, `/posts`, `/notices`, `/users`, `/pending-users` (해당 학과 가입 대기자), `/users/{id}/status`, `/monthly-stats`, `/professors`, `/univ-professors` (같은 학교 전체 교수), `/courses`, `/assignments`

**학부 관리자 (`SUPER` + `SCHOOL` 전용, DEPT_ADMIN 차단)** — `/api/admin/faculty/*`
- `?facultyId=X` 쿼리 필수
- `/stats`, `/visitors`, `/posts`, `/notices`, `/users`, `/pending-users` (해당 학부 소속 학과 가입 대기자), `/users/{id}/status`, `/monthly-stats`

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

- **BCrypt 암호화**: 회원가입 및 Mock 계정 시딩 시 BCrypt 해시 저장, 로그인 시 검증
- **비밀번호 조건 강화**: 8자 이상, 영문·숫자·특수문자 각 1자 이상 포함 필수. 조건 미충족 시 400 반환.
- **학번/교번 중복 방지**: 같은 대학(`universityId`) 내 동일 `studentId` 중복 가입 차단.
- **회원 유형**: `student`(학생) / `professor`(교수) / `employee`(직원) / `assistant`(조교) / `admin`(관리자)
- **grade 처리**: 학생만 학년(1~4) 저장. 교수·조교·직원은 `grade=null`. 조교가 4학년 재학생처럼 저장되던 문제 수정.
- **사용자 상태 (`APP_USERS.STATUS`)**: `ACTIVE` / `PENDING_APPROVAL` / `SUSPENDED` / `DELETED`
- **관리자 역할 (`APP_USERS.ADMIN_ROLE`)**: `SUPER_ADMIN` (전 시스템) / `SCHOOL_ADMIN` (자기 학교) / `DEPT_ADMIN` (자기 학과)
- **가입 승인 흐름**: 모든 유형의 신규 가입자는 `status=PENDING_APPROVAL`로 시작하며 승인 전 로그인 불가. 관리자(`admin`) 신청은 SUPER_ADMIN이 SuperAdminPage에서 역할 선택 후 승인. 일반 사용자(학생·교수 등)는 소속 학교·학과·학부 관리자가 각 대시보드의 "가입 승인" 탭에서 승인 처리.
- **교수-로그인 계정 연결**: `APP_USERS.PROFESSOR_ENTITY_ID` 컬럼으로 PROFESSORS 테이블 레코드와 연결. 교수 시간표 CRUD 시 해당 FK로 소유권 검증.
- **수업 시간표 자동 동기화**: `CLASS_SCHEDULES`에 교수가 CRUD를 수행하면 학생 조회 시 즉시 반영. 별도 캐시/알림 없이 Enrollment → ClassSchedule DB 조인으로 구현.
- **개인 캘린더 (`/calendar`)**: `CalendarRouter`가 로그인 여부를 reactive하게 감지해 분기. **로그인 시** — 권한별 일정 표시: 학생(개인·수업·학과 이벤트), 교수(개인·과목 이벤트·공지 작성), 관리자(전체). `ScheduleCalendarView`를 공유 컴포넌트로 사용하며 월간/주간/일간 뷰 전환·검색·필터 지원. **비로그인 시** — 현재 선택된 학과의 SchedulePage 표시.
- **일정 공개 범위**: `personal`(개인, ownerId 기준 본인만) / `dept`(학과, departmentId 기준) / `faculty`(학부) / `university`(학교, universityId 기준) / `course`(과목, 수강·담당 기준) / `announcement`(교수·조교 학과 공지, 소속 학과 학생만). 교수/조교는 과목 없이도 공지성 일정 등록 가능.
- **일정 수정·삭제 권한**: 일정 클릭 시 상세 보기 모달. 작성자 본인에게만 수정·삭제 버튼 표시. 백엔드에서도 ownerId 검증(권한 없으면 403).
- **마이페이지 학번/교번 표시**: 학생은 학번, 교수·조교는 교번을 "내 정보" 탭에서 표시. 로그인 응답 또는 `GET /api/auth/me`의 `studentId` 필드에서 조회.
- **authStorage.ts**: `sessionStorage` 우선, 없으면 `localStorage`(`auth_` prefix) 폴백으로 로그인 상태를 읽는 이중 저장소 패턴. Navbar의 `isLoggedIn` 계산에 사용.
- **학교 CRUD (SUPER_ADMIN)**: SuperAdminPage "학교 관리" 탭에서 University→CollegeSchool→FacultyGroup→Department 전체 계층을 생성·수정·삭제. 수정 시 Merge 전략(요청에 없는 기존 id → cascade 삭제), 삭제 시 모든 하위 데이터(교수, 수강신청, 수업 시간표, 공지 등) cascade 삭제 + 소속 사용자 universityId null화. 단일 `@Transactional` all-or-nothing.
- **수강신청 중복 방지**: `ENROLLMENTS(student_username, course_id, semester)` 복합 유니크 제약.
- **공개 범위**: 게시글 작성 시 `all`(전체) / `student`(학생만) / `professor`(교수만) 선택 가능
- **학년 필터**: 학생 게시글에 대상 학년(1~4학년) 태그 설정 가능
- **AdminBanner**: 일반 페이지에 떠 있는 "관리자 페이지" 진입 버튼. 역할별로 다른 어드민 대시보드로 라우팅
- **임베디드 모드**: `<DepartmentPage embedded />` / `<FacultyPage embedded />`로 어드민 대시보드의 "학과/학부 페이지" 탭 안에 일반 페이지를 표시 (Navbar/AdminBanner 숨김)
- **더미 데이터 제거**: `DummyDataHelper.java` 삭제 완료. 모든 데이터는 실 DB에서 직접 조회 (2026-06-03)
- **SPA 라우팅**: SpaController가 모든 프론트엔드 경로를 `index.html`로 포워딩
- **Oracle 데이터 영속성**: `ddl-auto=update` + Oracle 23ai Free — 서버 재시작 후에도 데이터 유지. DataInitializer는 최초 1회만 시딩하고 이후에는 마이그레이션만 수행.
- **MainPage 공지 표시 일관성**: 비소속·비로그인 사용자는 `isPublicToOutsiders=true` 공지만 표시 (MainPage/NoticePage 동일 기준 적용). 로그인 시 학과 일정·공개 공지만 표시, 게시글 잠금. 로그인 시 개인 일정+소속 학과·학부·학교 일정 통합 표시, 전체 공지·게시글 표시.
- **학교·학과 페이지 편집**: SCHOOL_ADMIN 이상이 SchoolInfoPage에서 학교 소개·시설·FAQ 등 섹션을 인라인 편집 가능. DepartmentPage에 커뮤니티·교육과정·교수 편집 폼 추가.
- **통합 시간표 (`/timetable`)**: 권한별 3가지 뷰 — 학생(강좌검색·수강신청·시간충돌감지), 교수(담당강좌·시간표 CRUD), 관리자(학과범위 배정강좌 시간 편집). 비로그인 시 접근 안내 표시.
- **가입 승인 탭**: SchoolAdminPage·DeptAdminPage·FacultyAdminPage에 각각 소속 범위의 `PENDING_APPROVAL` 사용자를 표시하고 승인/거절하는 "가입 승인" 탭 추가.
- **교수 배정 타 소속 지원**: 학과·학교 관리 페이지 교수 배정 폼에 "다른 소속 교수" 버튼 추가. 같은 학교의 전체 교수를 이름 검색으로 찾아 배정 가능. 백엔드 교수 소속 검증 제거.
- **MyPage 확장**: 학생 전용 "수업 선택" 탭(수강신청·취소) 추가. 내가 쓴 글·댓글에 인라인 수정·삭제 기능 추가.
- **SignupPage API 기반**: 대학 목록과 단과대·학과 목록을 하드코딩 대신 API(`/api/universities`)에서 동적 로드. `universityId` 페이로드에 실제 숫자 ID 저장.

---

## 주의사항

- `application-secret.properties`는 `.gitignore`에 등록되어 있으며 **절대 커밋하면 안 됩니다.**
- 테이블은 `ddl-auto=update`로 자동 생성·수정됩니다. Oracle `freepdb1` PDB가 실행 중이어야 합니다.
