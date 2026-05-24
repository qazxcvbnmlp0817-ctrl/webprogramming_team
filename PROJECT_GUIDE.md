# 학과정보통합서비스 — 프로젝트 가이드

> 이 문서를 읽으면 프로젝트의 전체 구성, 사용 기술, 동작 방식, 구현된 기능을 파악할 수 있습니다.

---

## 1. 프로젝트 개요

**프로젝트명:** 학과정보통합서비스 (dept-portal)

**목적:** 국립목포대학교 등 여러 대학교의 학과 공지사항, 게시판, 일정, 학과정보를 하나의 웹 포털로 통합하여 학생과 교직원이 편리하게 접근할 수 있도록 합니다.

**현재 단계:** 프론트엔드 UI + REST API + Oracle DB 연동 완성. 로그인·회원가입·인증, 관리자 시스템(3단계 역할), 교수 수업 시간표 CRUD, 학생 수강신청·시간표 자동 동기화까지 구현 완료. Mock 교수/학생 계정이 앱 시작 시 자동 시딩됩니다.

---

## 2. 기술 스택

| 분류 | 기술 | 역할 |
|------|------|------|
| 백엔드 언어 | Java 17 | 백엔드 전체 |
| 백엔드 프레임워크 | Spring Boot | REST API 서버, 정적 파일 서빙 |
| 프론트엔드 언어 | TypeScript + React 19 | UI 전체 |
| 프론트엔드 빌드 | Vite | 개발 서버, 프로덕션 빌드 |
| CSS 프레임워크 | Tailwind CSS (npm) | 모든 페이지 스타일링 |
| 아이콘 | Font Awesome 6.5 (CDN) | 아이콘 |
| 클라이언트 라우팅 | React Router v7 | SPA 페이지 전환 |
| 빌드 도구 (백엔드) | Maven (mvnw) | 빌드, 의존성 관리 |
| DB ORM | Spring Data JPA / Hibernate (`ddl-auto=update`) | DB 연동 완료 |
| DB | Oracle 23ai Free (`freepdb1`) | 실제 데이터 저장소 (로컬 설치) |
| JDBC 드라이버 | ojdbc11 | Oracle DB 접속 |
| 버전 관리 | Git | 팀 협업 |

---

## 3. 아키텍처 — 프론트/백 분리 구조

이 프로젝트는 **React SPA + Spring Boot REST API** 구조입니다. Thymeleaf는 사용하지 않습니다.

```
브라우저
  │
  └─── HTTP 요청
         │
         ├── /api/*  ──────────────▶  Spring Boot (Java)
         │                             REST API 응답 (JSON)
         │
         └── 그 외 경로 ──────────▶  Spring Boot가 index.html 반환
                                       브라우저에서 React가 실행되어
                                       클라이언트 측에서 페이지 렌더링
```

### 개발 모드 (두 서버 동시 실행)

```
브라우저 → localhost:5173 (Vite 개발 서버)
                │  소스 파일(.tsx)을 실시간 변환 서빙
                │  파일 저장 시 즉시 화면 반영 (HMR)
                │
                └── /api/* 요청만 → localhost:8080 (Spring Boot) 으로 중계
```

### 운영/확인 모드 (Spring Boot 하나만 실행)

```
npm run build 실행
      ↓
frontend/src/*.tsx  →  demo/src/main/resources/static/ (JS/CSS/HTML로 변환)
      ↓
Spring Boot(8080)만 실행
      ├── /api/*       → Java 컨트롤러
      └── 그 외 경로  → static/index.html (React 앱)
```

> **핵심:** `npm run build`는 React 소스코드를 Spring Boot가 서빙할 수 있는 정적 파일로 패키징합니다.
> 프론트엔드 코드를 수정했을 때만 다시 실행하면 됩니다.

---

## 4. 앱 실행 방법

### 방법 A — VS Code에서 Spring Boot만 실행 (권장, 간단)

프론트엔드 빌드 파일이 이미 `static/` 폴더에 포함되어 있습니다.

1. VS Code에서 `DemoApplication.java` 실행 (Run 버튼)
2. `http://localhost:8080` 접속

> React 코드를 수정했다면 먼저 `npm run build`를 실행한 뒤 Spring Boot를 재시작해야 반영됩니다.

### 방법 B — 개발 모드 (프론트엔드 즉시 반영)

```bash
# 터미널 1: 백엔드
cd demo/demo
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run

# 터미널 2: 프론트엔드
cd frontend
npm install                     # 처음 한 번만
npm run dev
```

`http://localhost:5173` 접속. `.tsx` 파일 저장 시 브라우저가 즉시 반영됩니다.

### 프론트엔드 빌드 (8080에 반영)

```bash
cd frontend
npm run build
# → demo/demo/src/main/resources/static/ 에 빌드 결과 저장
# → Spring Boot 재시작 후 http://localhost:8080 에서 확인
```

### 작업 상황별 정리

| 상황 | 해야 할 것 |
|------|-----------|
| Java만 수정 | Spring Boot 재시작만 |
| React/TS 수정 후 8080으로 확인 | `npm run build` → Spring Boot 재시작 |
| React/TS 수정 중 (즉시 확인) | 방법 B로 5173 사용 |

---

## 5. 프로젝트 디렉터리 구조

```
webprogramming_team-main/
│
├── frontend/                           ← React 프론트엔드
│   ├── package.json                    ← npm 의존성 목록
│   ├── vite.config.ts                  ← Vite 설정 (빌드 출력 경로, 프록시)
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx                    ← React 앱 진입점
│       ├── App.tsx                     ← 전체 라우팅 정의
│       │
│       ├── context/
│       │   └── DeptContext.tsx         ← 전역 상태 (선택된 대학/학과 정보)
│       │
│       ├── hooks/
│       │   ├── useDeptFetch.ts         ← 범용 데이터 fetching 훅
│       │   └── useInitialRedirect.ts   ← 앱 시작 시 리다이렉트 목적지 결정 훅
│       │
│       ├── api/                        ← 백엔드 API 호출 함수
│       │   ├── universities.ts         ← /api/universities
│       │   ├── departments.ts          ← /api/departments/:id
│       │   ├── notices.ts              ← /api/notices
│       │   ├── posts.ts                ← /api/posts
│       │   ├── schedules.ts            ← /api/schedules
│       │   ├── school.ts               ← /api/school/*
│       │   └── auth.ts                 ← /api/auth/* (로그인·회원가입·아이디·비밀번호 찾기)
│       │
│       ├── utils/                      ← 공유 순수 유틸리티 함수
│       │   └── scheduleUtils.ts        ← groupByMonth() — 3개 일정 페이지 공유
│       │
│       ├── data/                       ← 프론트엔드 더미/정적 데이터
│       │   └── footerData.ts           ← 푸터 표시 정보 (대학명·주소·연락처·저작권)
│       │
│       ├── types/                      ← TypeScript 타입 정의
│       │   ├── university.ts
│       │   ├── department.ts
│       │   ├── notice.ts
│       │   ├── post.ts
│       │   └── schedule.ts
│       │
│       ├── pages/                      ← 각 URL에 대응하는 페이지 컴포넌트
│       │   ├── UniversityListPage.tsx  ← /universities
│       │   ├── UniversityShowPage.tsx  ← /universities/:id
│       │   ├── SchoolDepartmentsPage.tsx ← /school/departments
│       │   ├── SchoolNoticePage.tsx    ← /school/notice
│       │   ├── SchoolNoticeWritePage.tsx ← /school/notice/write (교수·관리자만)
│       │   ├── SchoolBoardPage.tsx     ← /school/board
│       │   ├── SchoolWritePostPage.tsx ← /school/board/write (학년태그·공개범위 포함)
│       │   ├── SchoolSchedulePage.tsx  ← /school/schedule
│       │   ├── SchoolInfoPage.tsx      ← /school/info
│       │   ├── FacultyPage.tsx         ← /school/faculty/:facultyId (학부 메인)
│       │   ├── FacultyNoticePage.tsx   ← /school/faculty/:facultyId/notice
│       │   ├── FacultyNoticeWritePage.tsx ← /school/faculty/:facultyId/notice/write (교수·관리자만)
│       │   ├── FacultyBoardPage.tsx    ← /school/faculty/:facultyId/board
│       │   ├── FacultySchedulePage.tsx ← /school/faculty/:facultyId/schedule
│       │   ├── MainPage.tsx            ← /dept/home (학과 메인)
│       │   ├── MainPage.test.tsx
│       │   ├── NoticePage.tsx          ← /dept/notice
│       │   ├── NoticePage.test.tsx
│       │   ├── NoticeWritePage.tsx     ← /dept/notice/write (교수·관리자만)
│       │   ├── BoardPage.tsx           ← /dept/board
│       │   ├── BoardPage.test.tsx
│       │   ├── WritePostPage.tsx       ← /dept/board/write (글쓰기)
│       │   ├── SchedulePage.tsx        ← /dept/schedule
│       │   ├── DepartmentPage.tsx      ← /dept/department
│       │   ├── LoginPage.tsx           ← /login
│       │   ├── SignupPage.tsx          ← /signup
│       │   ├── MyPage.tsx              ← /mypage
│       │   ├── FindIdPage.tsx          ← /find-id
│       │   └── FindPasswordPage.tsx    ← /find-password
│       │
│       └── components/                 ← 재사용 컴포넌트
│           ├── Navbar.tsx              ← 상단 네비게이션 바
│           ├── Navbar.test.tsx
│           ├── Footer.tsx              ← 하단 고정 푸터 (/universities 제외)
│           ├── FeaturedCard.tsx
│           ├── FilterTabs.tsx
│           ├── FilterTabs.test.tsx
│           ├── MiniCalendar.tsx        ← 월별 미니 캘린더 (학과·학부 메인 페이지)
│           ├── MiniCalendar.test.tsx
│           ├── Sidebar.tsx
│           ├── Sidebar.test.tsx
│           └── Pagination.tsx
│
├── demo/demo/                          ← Spring Boot 백엔드
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   └── src/
│       ├── main/
│       │   ├── java/com/example/demo/
│       │   │   ├── DemoApplication.java
│       │   │   ├── controller/
│       │   │   │   ├── SpaController.java              ← SPA 라우트 → index.html 포워딩
│       │   │   │   ├── UniversityController.java       ← GET /api/universities
│       │   │   │   ├── DepartmentController.java       ← GET /api/departments/:id
│       │   │   │   ├── MainController.java             ← GET /api/main, /api/faculty/main
│       │   │   │   ├── NoticeController.java           ← GET /api/notices
│       │   │   │   ├── BoardController.java            ← GET /api/posts
│       │   │   │   ├── ScheduleController.java         ← GET /api/schedules
│       │   │   │   ├── SchoolController.java           ← GET /api/school/*
│       │   │   │   ├── AuthController.java             ← POST/GET /api/auth/* (인증)
│       │   │   │   ├── ProfessorScheduleController.java ← /api/professor/* (교수 전용 CRUD)
│       │   │   │   ├── StudentScheduleController.java  ← /api/student/* (학생 수강신청·시간표)
│       │   │   │   ├── SuperAdminController.java       ← /api/admin/super/*
│       │   │   │   ├── SchoolAdminController.java      ← /api/admin/school/*
│       │   │   │   ├── DeptAdminController.java        ← /api/admin/dept/*
│       │   │   │   └── FacultyAdminController.java     ← /api/admin/faculty/*
│       │   │   ├── service/
│       │   │   │   ├── AuthService.java                ← 인증 비즈니스 로직
│       │   │   │   ├── AdminService.java               ← 어드민 통계/사용자/승인 로직
│       │   │   │   └── ProfessorScheduleService.java   ← 교수 시간표 CRUD + 학생 수강신청
│       │   │   ├── entity/
│       │   │   │   ├── User.java                      ← 회원 (professorEntityId 포함)
│       │   │   │   ├── Professor.java                 ← 교수
│       │   │   │   ├── CurriculumItem.java            ← 교육과정
│       │   │   │   ├── ClassSchedule.java             ← 수업 시간표 (CLASS_SCHEDULES)
│       │   │   │   ├── Enrollment.java                ← 수강신청 (ENROLLMENTS)
│       │   │   │   ├── ProfessorCourseAssignment.java ← 교수-강좌 배정
│       │   │   │   └── (University 트리, Notice, Post, Schedule, AdminLog, PageVisit)
│       │   │   ├── repository/
│       │   │   │   ├── UserRepository.java                      ← 회원 저장소
│       │   │   │   ├── ProfessorRepository.java                 ← 교수 저장소
│       │   │   │   ├── CurriculumItemRepository.java            ← 교육과정
│       │   │   │   ├── ClassScheduleRepository.java             ← 수업 시간표
│       │   │   │   ├── EnrollmentRepository.java                ← 수강신청
│       │   │   │   ├── ProfessorCourseAssignmentRepository.java ← 교수-강좌 배정
│       │   │   │   └── (기타 University 트리, Notice, Post 등)
│       │   │   ├── dto/
│       │   │   │   ├── ClassScheduleDto.java          ← 수업 시간표 응답
│       │   │   │   ├── ClassScheduleRequestDto.java   ← 수업 시간표 생성/수정 요청
│       │   │   │   ├── LoginRequestDto.java
│       │   │   │   ├── SignupRequestDto.java
│       │   │   │   ├── FindIdRequestDto.java
│       │   │   │   └── FindPasswordRequestDto.java
│       │   │   └── util/
│       │   │       ├── DummyDataHelper.java             ← 더미 데이터 폴백
│       │   │       ├── AdminUserInitializer.java        ← SUPER_ADMIN 시드 (@Order 3)
│       │   │       ├── DataInitializer.java             ← 대학·학과 시드 + 마이그레이션 (@Order 4)
│       │   │       ├── ProfessorAccountInitializer.java ← 교수/학생 Mock 시드 (@Order 5)
│       │   │       └── StatusMigrationRunner.java       ← STATUS 컬럼 마이그레이션
│       │   └── resources/
│       │       ├── application.properties
│       │       └── static/                       ← npm run build 결과물 (자동 생성)
│       └── test/
│
├── docs/                               ← 설계 문서
├── PROJECT_GUIDE.md                    ← 이 파일
├── PROMPTS.md                          ← 세션 간 작업 기록
└── README.md
```

---

## 6. URL 라우팅 구조

### 프론트엔드 라우트 (React Router)

| URL | 페이지 | 설명 |
|-----|--------|------|
| `/` | — | `/universities`로 자동 리다이렉트 (진입점) |
| `/universities` | UniversityListPage | 대학교 목록 선택 |
| `/universities/:id` | UniversityShowPage | 대학교 홈 |
| `/school/departments` | SchoolDepartmentsPage | 학부·학과 선택 |
| `/school/notice` | SchoolNoticePage | 대학 공지사항 |
| `/school/notice/write` | SchoolNoticeWritePage | 대학 공지 작성 (교수·관리자) |
| `/school/board` | SchoolBoardPage | 대학 게시판 |
| `/school/board/write` | SchoolWritePostPage | 대학 게시글 작성 (학년태그·공개범위) |
| `/school/schedule` | SchoolSchedulePage | 대학 일정 |
| `/school/info` | SchoolInfoPage | 대학 정보 |
| `/school/faculty/:facultyId` | FacultyPage | 학부 메인 대시보드 |
| `/school/faculty/:facultyId/notice` | FacultyNoticePage | 학부 공지사항 |
| `/school/faculty/:facultyId/notice/write` | FacultyNoticeWritePage | 학부 공지 작성 (교수·관리자) |
| `/school/faculty/:facultyId/board` | FacultyBoardPage | 학부 게시판 |
| `/school/faculty/:facultyId/schedule` | FacultySchedulePage | 학부 일정 |
| `/dept/home` | MainPage | 학과 메인 대시보드 |
| `/dept/notice` | NoticePage | 학과 공지사항 |
| `/dept/notice/write` | NoticeWritePage | 학과 공지 작성 (교수·관리자) |
| `/dept/board` | BoardPage | 학과 게시판 |
| `/dept/board/write` | WritePostPage | 학과 게시글 작성 |
| `/dept/schedule` | SchedulePage | 학과 일정 |
| `/dept/department` | DepartmentPage | 학과정보 |
| `/login` | LoginPage | 로그인 |
| `/signup` | SignupPage | 회원가입 |
| `/mypage` | MyPage | 마이페이지 |
| `/find-id` | FindIdPage | 아이디 찾기 |
| `/find-password` | FindPasswordPage | 비밀번호 찾기 |

**사용자 흐름:**

```
/ (진입)
  → /universities              대학교 선택
  → /school/departments        학부·학과 선택
      ├── 학부 클릭 → /school/faculty/:id   학부 메인 대시보드
      │                  └── /school/faculty/:id/notice|board|schedule
      └── 학과 클릭 → /dept/home            학과 메인 대시보드
                         └── /dept/*
```

**접근 보호 (`App.tsx`):**

| 가드 | 적용 라우트 | 조건 미충족 시 |
|------|------------|--------------|
| `ProtectedSchool` | `/school/*` (학교·학부 모든 하위 경로) | `selectedUniversityId` 없음 → `/universities` |
| `ProtectedDept` | `/dept/home`, `/dept/notice`, `/dept/board`, `/dept/board/write`, `/dept/schedule`, `/dept/department` | `selectedDeptId` 없음 → `/universities` |

### 백엔드 API 엔드포인트

| 메서드 | URL | 파라미터 | 설명 |
|--------|-----|----------|------|
| GET | `/api/universities` | - | 전체 대학교 목록 |
| GET | `/api/universities/:id` | - | 특정 대학교 상세 (단과대·학부·학과 트리) |
| GET | `/api/departments/:id` | - | 학과 상세 (교수진, 교육과정, 연락정보) |
| GET | `/api/notices` | `deptId` | 학과 공지사항 목록 |
| GET | `/api/posts` | `deptId` | 학과 게시판 목록 |
| GET | `/api/schedules` | `deptId` | 학과 일정 목록 |
| GET | `/api/school/notices` | `univId` | 대학 공지사항 목록 |
| GET | `/api/school/posts` | `univId` | 대학 게시판 목록 |
| GET | `/api/school/schedules` | `univId` | 대학 일정 목록 |
| GET | `/api/school/info` | `univId` | 대학 정보 |
| GET | `/api/main` | `deptId` | 학과 메인 (공지5·게시글5·일정·오늘날짜) |
| GET | `/api/faculty/main` | `facultyId` | 학부 메인 (공지5·게시글5·일정·오늘날짜) |
| GET | `/api/faculty/notices` | `facultyId` | 학부 공지사항 목록 |
| GET | `/api/faculty/posts` | `facultyId` | 학부 게시판 목록 |
| GET | `/api/faculty/schedules` | `facultyId` | 학부 일정 목록 |
| POST | `/api/auth/login` | Body: `{username, password, memberType}` | 로그인 |
| POST | `/api/auth/signup` | Body: 회원 정보 | 회원가입 |
| GET | `/api/auth/check-id` | `username` | 아이디 중복 확인 |
| POST | `/api/auth/find-id` | Body: `{name, phone}` | 아이디 찾기 |
| POST | `/api/auth/find-password` | Body: `{username, name, phone}` | 비밀번호 찾기 (임시 비밀번호 반환) |
| GET | `/api/professor/class-schedules` | Header: `X-Username` | 교수 수업 시간표 전체 조회 |
| GET | `/api/professor/class-schedules?semester=` | Header: `X-Username` | 학기별 수업 시간표 조회 |
| POST | `/api/professor/class-schedules` | Header: `X-Username`, Body: 시간표 정보 | 수업 시간표 등록 |
| PUT | `/api/professor/class-schedules/{id}` | Header: `X-Username`, Body: 수정 정보 | 수업 시간표 수정 |
| DELETE | `/api/professor/class-schedules/{id}` | Header: `X-Username` | 수업 시간표 삭제 |
| GET | `/api/student/class-schedules?semester=` | Header: `X-Username` | 수강신청 기반 내 시간표 조회 |
| GET | `/api/student/enrollments?semester=` | Header: `X-Username` | 수강신청 목록 조회 |
| POST | `/api/student/enrollments` | Header: `X-Username`, Body: `{courseId, semester}` | 수강신청 |
| DELETE | `/api/student/enrollments/{enrollmentId}` | Header: `X-Username` | 수강신청 취소 |

---

## 7. 전역 상태 — DeptContext

사용자가 선택한 대학교·학과 정보를 앱 전체에서 공유합니다. `localStorage`에 저장되어 새로고침 후에도 유지됩니다.

| 상태 필드 | 타입 | 설명 |
|-----------|------|------|
| `selectedUniversityId` | number \| null | 선택된 대학교 ID |
| `selectedUniversityName` | string | 선택된 대학교 이름 |
| `selectedDeptId` | number \| null | 선택된 학과 ID |
| `selectedDeptName` | string | 선택된 학과 이름 |
| `selectedSchoolName` | string | 선택된 단과대학 이름 |

---

## 8. 데이터 모델 (DTO)

### UniversityDto / SchoolDto / FacultyDto / DeptSelectionDto (대학 트리)

```
UniversityDto
  └── schools: SchoolDto[]          (단과대학)
        └── faculties: FacultyDto[] (학부)
              └── depts: DeptSelectionDto[] (학과)
```

### DepartmentDetailDto (학과 상세)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | number | 학과 ID |
| name | string | 학과명 |
| description | string | 학과 소개 |
| professors | ProfessorDto[] | 교수진 목록 |
| curriculum | CurriculumItemDto[] | 교육과정 목록 |
| address | string | 주소 |
| phone | string | 전화번호 |
| email | string | 이메일 |
| hours | string | 운영시간 |

### NoticeDto / PostDto / ScheduleDto

공지사항·게시판 API는 `{ featured, notices[] }` / `{ featured, posts[] }` 형태로 반환합니다.
일정 API는 `ScheduleDto[]` 배열을 직접 반환합니다.

---

## 9. 더미 데이터 구조

모든 더미 데이터는 `DummyDataHelper.java` 한 곳에 집중되어 있습니다.

- **대학 트리:** 목포대학교(18개 학과, 6개 단과대), 순천대학교(4개 학과) 하드코딩
- **학과별 데이터:** `deptId`를 받아 학과명 기반으로 공지·게시글·일정을 동적 생성
- **대학별 데이터:** `univId`를 받아 대학명 기반으로 공지·게시글·일정을 동적 생성
- **학부별 데이터:** `facultyId`를 받아 공지(8개)·게시글(10개)·일정(8개)을 동적 생성. ID 충돌 방지를 위해 `facultyId × 300/400/500` 오프셋 사용
- **학과 상세:** `deptId`로 교수진(3명)·교육과정(6개)·연락정보를 생성

> DB 연동 시: 각 컨트롤러에서 `DummyDataHelper` 호출 부분을 Service 호출로 교체하면 됩니다.

---

## 10. Navbar 동작 방식

`Navbar.tsx`는 현재 URL 경로에 따라 자동으로 세 가지 모드로 전환됩니다.

| 모드 | 조건 | 표시 링크 | 배지 |
|------|------|----------|------|
| 학부(Faculty) 모드 | `/school/faculty/:id/*` | 홈·공지사항·게시판·일정·학과선택 | `학부 포털` |
| 학교(School) 모드 | `/school/*` (학부 제외) 또는 `/universities/:id` | 학과선택·공지사항·게시판·일정·학교정보 | 대학명 |
| 학과(Dept) 모드 | `/dept/*` | 공지사항·게시판·일정·학과정보 | 학과명 |

- 학부 모드: 로고 클릭 시 `/school/faculty/:id` (학부 홈)으로 이동
- 학교 모드: 로고 클릭 시 `/universities/:id` (대학 홈)으로 이동
- 학과 모드: 로고 클릭 시 `/dept/home` (학과 메인)으로 이동

> 학부 경로 감지: `pathname.match(/^\/school\/faculty\/(\d+)/)` 로 facultyId를 추출하여 링크를 동적 생성합니다.

---

## 11. 레이아웃 구조 — Sticky Footer

`App.tsx`에서 전체 앱을 `min-h-screen flex flex-col` 래퍼로 감싸 Sticky Footer를 구현합니다.

```
App.tsx
└── <div class="min-h-screen flex flex-col">   ← 전체 높이 보장
      ├── <div class="flex-1">                  ← 콘텐츠 영역 (빈 공간 채움)
      │     └── <Routes> ... </Routes>          ← 각 페이지 (Navbar 포함)
      └── <Footer />                            ← 항상 하단 고정
```

개별 페이지를 수정하지 않고 `App.tsx` 한 곳에서 전체 적용합니다.

### Footer 표시 제외 페이지

`Footer.tsx` 내부의 `FOOTER_HIDDEN_PATHS` 배열로 관리합니다.

```ts
const FOOTER_HIDDEN_PATHS = ['/universities']
```

제외할 경로가 추가되면 이 배열에 경로 문자열만 추가하면 됩니다.

### 푸터 데이터 (`data/footerData.ts`)

| 필드 | 설명 |
|------|------|
| `universityName` | 대학교 이름 |
| `serviceName` | 서비스 이름 |
| `address` | 주소 |
| `phone` | 대표 전화 |
| `email` | 웹마스터 이메일 |
| `copyright` | 저작권 문구 (연도 자동 계산) |
| `links` | 하단 링크 목록 (`label`, `href`) |

> DB 연동 시: `footerData` 상수를 API 호출 결과로 교체하면 됩니다.

---

## 12. 인증(로그인·회원가입) 구현 현황

### 현재 구조

인증 기능이 `AuthController` → `AuthService` → `UserRepository` (JPA) 구조로 Oracle DB에 완전히 연동되어 있습니다.

- **회원 저장소:** Spring Data JPA + Oracle 23ai Free. 서버 재시작 후에도 데이터가 유지됩니다.
- **비밀번호:** BCryptPasswordEncoder로 해시 저장. 회원가입, Mock 계정 시딩 모두 적용.
- **세션/토큰:** 별도 JWT 없음. 로그인 성공 시 응답 JSON 반환, 클라이언트가 sessionStorage에 저장하여 이후 요청마다 `X-Username` 헤더로 전송.
- **공지 작성 접근 제어:** `NoticeWritePage`, `SchoolNoticeWritePage`, `FacultyNoticeWritePage`는 마운트 시 `sessionStorage.getItem('memberType')`을 확인합니다. `professor` 또는 `admin`이 아니면 해당 공지 목록 페이지로 즉시 리다이렉트합니다.

### 회원 유형 (memberType)

| 값 | 설명 |
|----|------|
| `student` | 일반 학생 |
| `professor` | 교수 |
| `admin` | 관리자 (가입 후 승인 필요) |

### useInitialRedirect.ts 리다이렉트 로직

```ts
// [AUTH_HOOK] 로그인 기반 리다이렉트 진입점
// 인증 시스템 추가 시 이 아래에 주입:
// const user = useAuth()
// if (user?.deptId) return `/dept-redirect/${user.deptId}`

if (selectedDeptId) return null
if (selectedUniversityId) return '/school/departments'
return '/universities'
```

| 상태 | `/` 접속 시 이동 경로 |
|------|----------------------|
| localStorage에 학과 저장됨 | 현재 경로 유지 (`/dept/home` 등) |
| localStorage에 대학교만 있음 | `/school/departments` (학과 선택) |
| localStorage 비어있음 | `/universities` (대학교 선택) |

> **localStorage 초기화:** 브라우저 콘솔에서 `localStorage.removeItem('deptState')` 실행

---

## 12. DB 연동 방법 (팀원 작업 시)

1. `docs/DB_SETUP_GUIDE.md` 참고하여 `application-secret.properties` 생성
2. Oracle 23ai Free 로컬 설치 + `dept_user` 계정 생성 (가이드 참고)
3. Spring Boot 실행 — `ddl-auto=update`로 테이블 자동 생성, DataInitializer + ProfessorAccountInitializer가 시드 데이터 자동 삽입

**주의:** `application-secret.properties`는 `.gitignore`에 등록되어 있어 Git에 절대 올라가지 않습니다.

---

## 13. 파일별 역할 한 줄 요약

| 파일 | 역할 |
|------|------|
| `App.tsx` | 전체 라우트 정의, ProtectedSchool/ProtectedDept 접근 보호, sticky footer 레이아웃 |
| `Footer.tsx` | 하단 고정 푸터. `FOOTER_HIDDEN_PATHS`로 특정 경로 제외 가능 |
| `data/footerData.ts` | 푸터 표시 정보 더미 데이터. DB 연동 시 API 응답으로 교체 |
| `DeptContext.tsx` | 선택된 대학/학과 전역 상태, localStorage 동기화 |
| `useDeptFetch.ts` | fetcher 함수 + id를 받아 데이터 로딩 처리하는 범용 훅 |
| `useInitialRedirect.ts` | 앱 시작 리다이렉트 결정 훅. 로그인 연동 시 `[AUTH_HOOK]` 주석 위치에 주입 |
| `Navbar.tsx` | URL 기반 학교/학부/학과 3모드 자동 전환 네비게이션 바 |
| `UniversityListPage.tsx` | 대학교 카드 목록, 선택 시 학과 선택 페이지로 이동 |
| `UniversityShowPage.tsx` | 대학교 홈 (단과대 목록, 바로가기) |
| `SchoolDepartmentsPage.tsx` | 단과대·학부·학과 3단 계층 그리드. 학부명 클릭 시 `/school/faculty/:id`, 학과 클릭 시 `/dept/home`으로 이동 |
| `FacultyPage.tsx` | 학부 메인 대시보드 (캘린더·일정·공지·인기 게시글 2×2 그리드) |
| `FacultyNoticePage.tsx` | 학부 공지사항 (탭 필터·FeaturedCard·Sidebar) |
| `FacultyNoticeWritePage.tsx` | 학부 공지 작성 폼. `sessionStorage.memberType`이 professor/admin이 아니면 목록으로 리다이렉트 |
| `FacultyBoardPage.tsx` | 학부 게시판 (검색·탭·정렬·소속학과 빠른이동) |
| `FacultySchedulePage.tsx` | 학부 일정 (월별 그룹·D-Day 배지·Sidebar) |
| `DepartmentPage.tsx` | 학과 상세 (API에서 교수진·교육과정·연락정보 조회) |
| `NoticeWritePage.tsx` | 학과 공지 작성 폼. 교수·관리자 전용. 카테고리·제목·내용·사진·파일 첨부 |
| `WritePostPage.tsx` | 학과 게시글 작성 폼 (`/dept/board/write`) |
| `SchoolNoticeWritePage.tsx` | 학교 공지 작성 폼. 교수·관리자 전용 |
| `SchoolWritePostPage.tsx` | 학교 게시글 작성 폼. 학년 태그(1~4학년 다중선택), 공개범위(전체/해당학년) 포함 |
| `MiniCalendar.tsx` | 월별 미니 캘린더. `ScheduleDto[]`를 받아 일정 점(dot)으로 표시, hover 시 팝오버로 일정 목록 표시 |
| `LoginPage.tsx` | 로그인 폼, `auth.ts`의 `loginApi` 호출 |
| `SignupPage.tsx` | 회원가입 폼 (학생·교수·관리자 선택), `signupApi` 호출 |
| `MyPage.tsx` | 마이페이지 (로그인 사용자 정보 표시) |
| `FindIdPage.tsx` | 이름·전화번호로 아이디 찾기 |
| `FindPasswordPage.tsx` | 아이디·이름·전화번호로 임시 비밀번호 발급 |
| `auth.ts` | `/api/auth/*` 호출 함수 (login, signup, checkId, findId, findPassword) |
| `SpaController.java` | `/api/**` 외 모든 경로를 `index.html`로 포워딩 (SPA 새로고침 지원) |
| `MainController.java` | `GET /api/main` (학과 메인), `GET /api/faculty/main` (학부 메인) — 공지5·게시글5·일정 전체·오늘날짜 반환 |
| `AuthController.java` | `POST/GET /api/auth/*` — 로그인·회원가입·아이디/비밀번호 찾기 |
| `AuthService.java` | 인증 비즈니스 로직. DB 연동 시 BCrypt 주석 참고 |
| `User.java` | 회원 엔티티. DB 연동 시 JPA 어노테이션 주석 해제 |
| `UserRepository.java` | 회원 저장소 인터페이스 |
| `UserRepositoryImpl.java` | 인메모리 구현체. DB 연동 시 이 파일 삭제 |
| `DummyDataHelper.java` | 모든 더미 데이터 집중 관리 (DB 연동 전 임시) |
| `UniversityController.java` | `GET /api/universities[/:id]` 응답 |
| `DepartmentController.java` | `GET /api/departments/:id` 응답 |
| `SchoolController.java` | `GET /api/school/*` 응답 |
| `application.properties` | 포트(8080), 정적 리소스 no-cache 설정 |
| `utils/scheduleUtils.ts` | `groupByMonth(ScheduleDto[])` 공유 함수. SchedulePage·FacultySchedulePage·SchoolSchedulePage가 import |
| `vite.config.ts` | 빌드 출력 경로(`static/`), `/api` 프록시 설정 |

---

## 14. 관리자 시스템 (2026-05-22 추가)

> 일부 상단 섹션(11번 인증 — "인메모리" 등)은 2026-05-20 Oracle DB 연동 후 갱신되지 않았습니다. 이 섹션이 현재 동작 기준입니다.

### 14.1 역할 모델

`APP_USERS` 테이블의 두 컬럼이 권한 결정에 사용됩니다.

| 컬럼 | 값 | 의미 |
|------|-----|------|
| `STATUS` | `ACTIVE` | 정상 사용자 — 로그인 가능 |
|          | `PENDING_APPROVAL` | 관리자 가입 신청 대기 — 로그인 차단 |
|          | `SUSPENDED` | 정지됨 — 로그인 차단 |
|          | `DELETED` | 소프트 삭제 — 로그인 차단 |
| `ADMIN_ROLE` | `SUPER_ADMIN` | 전 시스템 + 모든 학교 관리 |
|              | `SCHOOL_ADMIN` | 자기 학교의 학부/학과/사용자 관리 |
|              | `DEPT_ADMIN` | 자기 학과만 관리 |
|              | `null` | 일반 사용자 |

### 14.2 인증 흐름

1. **회원가입** (`AuthService.signup`)
   - 일반 사용자(`student`/`professor`/`staff`) → `STATUS=ACTIVE`, `ADMIN_ROLE=null`
   - 관리자 신청(`memberType=admin`) → `STATUS=PENDING_APPROVAL`, `ADMIN_ROLE=null` (역할은 승인자가 결정)

2. **로그인** (`AuthService.login`)
   - `STATUS` 분기:
     - `PENDING_APPROVAL` → "관리자 승인 후 이용 가능합니다."
     - `SUSPENDED` → "계정이 정지되었습니다."
     - `DELETED` → "존재하지 않는 계정입니다."
     - `ACTIVE` → 성공
   - 성공 응답에 `adminRole`, `universityId` 포함. DEPT_ADMIN의 경우 `deptId`도 함께 반환 (universityId + department 이름으로 역추적)
   - 프론트가 sessionStorage에 `adminRole`, `universityId`, `deptId`(있으면) 저장

3. **API 인증**
   - 클라이언트가 `X-Username` 헤더로 username 전송 (간이 인증)
   - 각 어드민 컨트롤러가 `userRepository.findByUsername(username).getAdminRole()`로 역할 검증
   - 권한 미달 시 `403 Forbidden` → 프론트의 `handle403`이 `/universities`로 리다이렉트

### 14.3 어드민 페이지와 라우트

| 경로 | 페이지 | 허용 역할 |
|------|--------|-----------|
| `/admin/super` | SuperAdminPage | SUPER_ADMIN |
| `/admin/school/:id` | SchoolAdminPage | SUPER_ADMIN, SCHOOL_ADMIN |
| `/admin/dept/:id` | DeptAdminPage | SUPER_ADMIN, SCHOOL_ADMIN, DEPT_ADMIN |
| `/admin/faculty/:id` | FacultyAdminPage | SUPER_ADMIN, SCHOOL_ADMIN |

- `:id`는 대상 스코프 id (universityId / facultyId / deptId)
- DEPT_ADMIN은 `/admin/dept/{본인 학과 id}`만 의미 있음 — 다른 id를 넣어도 백엔드가 본인 학과로 강제 해석

`App.tsx`의 라우트 가드 컴포넌트:
- `ProtectedSuperAdmin` / `ProtectedSchoolAdmin` / `ProtectedFacultyAdmin` / `ProtectedAdmin`(역할 무관, 어드민이면 통과)

### 14.4 AdminBanner — 일반 페이지의 어드민 진입 동선

`AdminBanner` 컴포넌트가 일반 페이지에 떠 있으면서 해당 페이지의 스코프에 해당하는 어드민 대시보드로 이동시킵니다.

| 스코프 | 표시되는 페이지 | 허용 역할 |
|--------|-----------------|-----------|
| `selection` | `/universities` | 모든 어드민 |
| `school` | UniversityShowPage / SchoolBoardPage 등 | SUPER, SCHOOL |
| `dept` | DepartmentPage / BoardPage 등 | SUPER, SCHOOL, DEPT |

`selection` 스코프의 URL 결정 로직:
- SUPER → `/admin/super`
- SCHOOL → `/admin/school/{sessionStorage.universityId}`
- DEPT → `/admin/dept/{sessionStorage.deptId}` (없으면 학교 대시보드로 폴백)

### 14.5 어드민 대시보드 구조

**SuperAdminPage** — 단일 페이지 스크롤 대시보드
- 4-카드 통계 (총 사용자, 7일/30일 신규 가입, 등록 학교)
- 차트 (방문자 추이, 사용자 현황)
- 등록 학교 목록 + 서버 인프라
- **관리자 가입 승인 대기 섹션** — 역할 드롭다운 + 승인/거절
- 관리자 계정 관리 테이블

**SchoolAdminPage / DeptAdminPage / FacultyAdminPage** — 6탭 구조 (동일 패턴)

| 탭 | 내용 |
|----|------|
| 개요 | 통계 카드 + 방문자 라인 차트 + 콘텐츠 비율 도넛 차트 |
| 학교/학과/학부 페이지 | 일반 페이지를 `embedded` 모드로 임베드 (Navbar/AdminBanner 숨김) |
| 게시글 관리 | 페이지네이션 + 삭제 |
| 공지 관리 | 페이지네이션 + 삭제 |
| 사용자 | 학교/학과/학부 소속 사용자 + 상태 변경 (ACTIVE/SUSPENDED/DELETED) |
| 통계 | 6개월 월간 신규가입/게시글/방문자 바 차트 |

학과/학부 대시보드 헤더에는 `[학과 글쓰기]`, `[공지 작성]` 버튼이 있어 기존 `/dept/board/write`, `/dept/notice/write` (또는 `/school/faculty/:id/*/write`) 라우트로 DeptContext 설정 후 이동합니다.

### 14.6 백엔드 — 스코프 해석 패턴

각 어드민 컨트롤러는 동일한 패턴의 `resolveXxxId` 헬퍼를 가집니다.

```java
private Long resolveDeptId(String username, Long deptIdParam) {
    User user = lookup(username);  // 없으면 403
    String role = user.getAdminRole();
    if ("SUPER_ADMIN".equals(role)) {
        require(deptIdParam != null);  // 400 if null
        return deptIdParam;
    }
    if ("SCHOOL_ADMIN".equals(role)) {
        require(deptIdParam != null);
        // dept → faculty → school 거슬러올라가 본인 학교 소속인지 확인
        verifyOwnsScope(user, deptIdParam);
        return deptIdParam;
    }
    if ("DEPT_ADMIN".equals(role)) {
        // 사용자 (universityId, department) 이름으로 dept id 역추적
        return adminService.resolveDeptIdByName(...);
    }
    throw 403;
}
```

같은 패턴이 `SchoolAdminController.resolveUnivId`, `FacultyAdminController.resolveFacultyId`에 적용됩니다. FacultyAdminController는 DEPT_ADMIN 분기를 의도적으로 빼서 403을 반환합니다 (학과 관리자가 상위 학부를 못 보도록).

### 14.7 ADMIN_LOGS — 관리자 액션 감사 로그

모든 상태 변경/역할 부여/승인/거절은 `AdminLog` 엔티티에 기록됩니다.

| 컬럼 | 설명 |
|------|------|
| `actorUsername` | 액션 수행자 |
| `actionType` | `APPROVE` / `REJECT` / `SUSPEND` / `UNSUSPEND` / `DELETE` / `ROLE_GRANT` / `ROLE_REVOKE` |
| `targetUsername` | 대상 사용자 (nullable) |
| `detail` | 사람이 읽을 수 있는 설명 |
| `universityId` | 스코프 필터링용 학교 id |
| `createdAt` | 액션 시각 |

`SchoolAdminPage`의 "활동 로그" 탭에서 학교 스코프로 필터링해 표시. DeptAdminPage/FacultyAdminPage에는 로그 탭 없음 (out of scope).

### 14.8 시드 데이터 / 마이그레이션

- `AdminUserInitializer` (`@Order(2)`) — 앱 시작 시 SUPER_ADMIN 시드 계정 자동 생성 (없으면)
- `StatusMigrationRunner` (`@Order(3)`) — 구버전 `APPROVED BOOLEAN` 컬럼을 기준으로 신규 `STATUS` 컬럼 백필. 후속 실행에서는 `ALTER TABLE APP_USERS MODIFY (APPROVED NULL)`을 PL/SQL EXCEPTION 블록으로 idempotent하게 실행해 NOT NULL 제약 제거 (회원가입 시 INSERT에 APPROVED 누락돼도 통과)

### 14.9 관련 설계 문서

- `docs/superpowers/specs/2026-05-22-school-admin-v2-design.md` — 학교 관리자 v2 (status 시스템, 가입 승인, 활동 로그)
- `docs/superpowers/specs/2026-05-22-dept-faculty-admin-design.md` — Dept/Faculty 관리자 대시보드 설계
- `docs/superpowers/plans/2026-05-22-dept-faculty-admin.md` — Dept/Faculty 구현 계획

---

## 15. 교수/학생 시간표 시스템 (2026-05-24 추가)

### 15.1 아키텍처 개요

교수가 수업 시간표를 등록·수정·삭제하면 수강신청한 학생의 시간표에 **즉시 자동 반영**됩니다. 별도 캐시·알림 없이 DB 조인으로 구현되어 있습니다.

```
[교수 CRUD]
  POST/PUT/DELETE /api/professor/class-schedules
        ↓
  CLASS_SCHEDULES 테이블 변경

[학생 조회]
  GET /api/student/class-schedules?semester=2025-1
        ↓
  ENROLLMENTS (studentUsername, semester) → courseIds
        ↓
  CLASS_SCHEDULES WHERE courseId IN (...) AND semester = ?
        ↓  ← 교수가 수정한 내용이 이 쿼리에서 즉시 반영됨
  ClassScheduleDto[] (courseName, professorName enriched)
```

### 15.2 데이터 모델

**CLASS_SCHEDULES** — 교수 수업 시간표

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT | PK |
| course_id | BIGINT | CURRICULUM_ITEMS.id FK |
| professor_id | BIGINT | PROFESSORS.id FK |
| dept_id | BIGINT | DEPTS.id FK |
| day_of_week | VARCHAR(5) | 월\|화\|수\|목\|금 |
| start_time | VARCHAR(10) | "09:00" 형식 |
| end_time | VARCHAR(10) | "10:30" 형식 |
| room | VARCHAR(100) | 강의실 |
| semester | VARCHAR(20) | "2025-1" 형식 |
| memo | VARCHAR(300) | 메모 (선택) |
| created_at | TIMESTAMP | 생성 시각 |
| updated_at | TIMESTAMP | 수정 시각 |

**ENROLLMENTS** — 학생 수강신청

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT | PK |
| student_username | VARCHAR(100) | APP_USERS.username |
| course_id | BIGINT | CURRICULUM_ITEMS.id FK |
| dept_id | BIGINT | DEPTS.id FK |
| semester | VARCHAR(20) | "2025-1" 형식 |
| enrolled_at | TIMESTAMP | 수강신청 시각 |
| UNIQUE | (student_username, course_id, semester) | 중복 수강신청 방지 |

**PROF_COURSE_ASSIGNMENTS** — 교수-강좌 배정 (교수 시간표 등록 권한 검증용)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT | PK |
| professor_id | BIGINT | PROFESSORS.id FK |
| course_id | BIGINT | CURRICULUM_ITEMS.id FK |
| dept_id | BIGINT | DEPTS.id FK |
| UNIQUE | (professor_id, course_id) | 중복 배정 방지 |

### 15.3 교수 계정 연결 구조

교수 로그인 계정(APP_USERS)과 교수 엔티티(PROFESSORS)는 별개입니다.

```
APP_USERS (prof_kim, memberType=professor)
  └── professor_entity_id ──▶ PROFESSORS (김민준, deptId=컴퓨터공학과)
```

`ProfessorScheduleService.resolveProf(username)` 메서드가 이 연결을 검증합니다:
1. username으로 User 조회 → memberType이 "professor"인지 확인
2. `professorEntityId`로 Professor 엔티티 조회
3. 해당 Professor가 강좌를 배정받았는지 `PROF_COURSE_ASSIGNMENTS`에서 확인

### 15.4 API 요청/응답 형식

**POST `/api/professor/class-schedules`** 요청 Body:

```json
{
  "courseId": 1,
  "dayOfWeek": "월",
  "startTime": "09:00",
  "endTime": "10:30",
  "room": "공학관 101호",
  "semester": "2025-1",
  "memo": "선택 메모"
}
```

**GET `/api/student/class-schedules?semester=2025-1`** 응답:

```json
[
  {
    "id": 1,
    "courseId": 10,
    "courseName": "컴퓨터공학과 개론",
    "professorId": 3,
    "professorName": "김민준",
    "deptId": 5,
    "dayOfWeek": "월",
    "startTime": "09:00",
    "endTime": "10:30",
    "room": "공학관 101호",
    "semester": "2025-1",
    "memo": null,
    "updatedAt": "2025-01-01T09:00:00"
  }
]
```

### 15.5 Mock 계정 및 시드 데이터

`ProfessorAccountInitializer` (@Order 5)가 앱 최초 실행 시 아래 데이터를 자동 생성합니다.

**교수 계정** (`memberType=professor`, password: `prof1234`):

| username | 이름 | 학과 | 강좌 | 수업 시간 |
|----------|------|------|------|----------|
| prof_kim | 김민준 | 컴퓨터공학과 | 컴퓨터공학과 개론 | 월·수 09:00–10:30 공학관 101호 |
| prof_lee | 이서준 | 컴퓨터공학과 | 전공기초 실습 | 화·목 13:00–15:00 실습실 201호 |
| prof_park | 박지호 | 컴퓨터공학과 | 심화 이론 | 월·수 14:00–15:30 공학관 202호 |
| prof_choi | 최예준 | 전기전자공학과 | 전기전자공학과 개론 | 화·목 09:00–10:30 전자관 101호 |
| prof_jung | 정시우 | 정보통신공학과 | 정보통신공학과 개론 | 수·금 11:00–12:30 정보관 301호 |

**학생 계정** (`memberType=student`, password: `stu1234`):

| username | 이름 | 학과 | 학년 | 수강신청 강좌 |
|----------|------|------|------|--------------|
| stu_kim1 | 김학생 | 컴퓨터공학과 | 1 | 컴퓨터공학과 개론, 전공기초 실습 |
| stu_lee2 | 이학생 | 컴퓨터공학과 | 2 | 심화 이론 |
| stu_park1 | 박학생 | 전기전자공학과 | 1 | 전기전자공학과 개론 |
