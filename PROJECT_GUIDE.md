# 학과정보통합서비스 — 프로젝트 가이드

> 이 문서를 읽으면 프로젝트의 전체 구성, 사용 기술, 동작 방식, 구현된 기능을 파악할 수 있습니다.

---

## 1. 프로젝트 개요

**프로젝트명:** 학과정보통합서비스 (dept-portal)

**목적:** 국립목포대학교 등 여러 대학교의 학과 공지사항, 게시판, 일정, 학과정보를 하나의 웹 포털로 통합하여 학생과 교직원이 편리하게 접근할 수 있도록 합니다.

**현재 단계:** 프론트엔드 UI + REST API + Oracle DB 연동 완성. 로그인·회원가입·인증, 관리자 시스템(3단계 역할), 교수 수업 시간표 CRUD, 학생 수강신청·시간표 자동 동기화, SUPER_ADMIN 학교 계층 CRUD, 가입 승인 시스템(학교·학부·학과 단위), 교수 학과 일정 공유, 개인 캘린더 + 소속 일정 통합 표시, 게시글/공지 숨김 처리, 관리자 직접 숨김/삭제 버튼, **학교·학과 페이지 콘텐츠 편집(SchoolInfoPage/DepartmentPage 인라인 편집)**, **통합 시간표 페이지(TimetablePage)** 구현 완료. 더미 데이터 완전 제거 — 모든 데이터는 실 DB에서 조회됩니다. Mock 교수/학생 계정이 앱 시작 시 자동 시딩됩니다.

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
│       │   ├── classSchedules.ts       ← /api/student/class-schedules (ClassScheduleDto + fetchStudentClassSchedules)
│       │   └── auth.ts                 ← /api/auth/* (로그인·회원가입·아이디·비밀번호 찾기·변경)
│       │
│       ├── utils/                      ← 공유 순수 유틸리티 함수
│       │   ├── scheduleUtils.ts        ← groupByMonth() — 3개 일정 페이지 공유
│       │   ├── authStorage.ts          ← 로그인 상태 이중 저장소 (sessionStorage 우선 → localStorage auth_ 폴백)
│       │   ├── localSchedule.ts        ← 개인 일정 localStorage 저장/로드
│       │   └── scheduleItem.ts         ← ScheduleItem 타입 + 공유 헬퍼
│       │
│       ├── data/                       ← 프론트엔드 더미/정적 데이터
│       │   └── (footerData.ts 삭제됨 — Footer가 DB에서 직접 로드)
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
│       │   ├── CalendarPage.tsx        ← /calendar (개인 캘린더, 로그인 전용 — 학생은 수업 시간표 자동 동기화)
│       │   ├── LoginPage.tsx           ← /login
│       │   ├── SignupPage.tsx          ← /signup
│       │   ├── MyPage.tsx              ← /mypage
│       │   ├── FindIdPage.tsx          ← /find-id (이름·소속대학·단과대·학번으로 찾기)
│       │   └── FindPasswordPage.tsx    ← /find-password (이름·소속대학·단과대·학번·아이디로 임시 비번 발급)
│       │
│       └── components/                 ← 재사용 컴포넌트
│           ├── Navbar.tsx              ← 상단 네비게이션 바 (인증 상태에 따라 "일정" 링크 동적 라우팅)
│           ├── Navbar.test.tsx
│           ├── Footer.tsx              ← 하단 고정 푸터 (/universities 제외)
│           ├── schedule/
│           │   └── ScheduleCalendarView.tsx ← 재사용 캘린더 UI (CalendarPage·SchedulePage·FacultySchedulePage·SchoolSchedulePage 공유)
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
│       │   │       ├── AdminUserInitializer.java        ← SUPER_ADMIN 시드 (@Order 3)
│       │   │       ├── DataInitializer.java             ← 대학·학과 시드 + 마이그레이션 (@Order 4)
│       │   │       ├── ProfessorAccountInitializer.java ← 교수/학생 Mock 시드 (@Order 5)
│       │   │       ├── StatusMigrationRunner.java       ← STATUS 컬럼 마이그레이션
│       │   │       └── GradeStatusMigrationRunner.java  ← 학년/재학상태 마이그레이션
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
| `/calendar` | CalendarRouter → CalendarPage / SchedulePage | **로그인 시** 개인 캘린더 (학생: 수업 시간표 자동 동기화, 교수/조교: 학과 이벤트 등록 가능) / **비로그인 시** 학과 일정(SchedulePage) |
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
| POST | `/api/auth/find-id` | Body: `{name, universityId, college, studentId}` | 아이디 찾기 |
| POST | `/api/auth/find-password` | Body: `{username, name, universityId, college, studentId}` | 비밀번호 찾기 (임시 비밀번호 반환) |
| POST | `/api/auth/change-password` | Body: `{currentPassword, newPassword}`, Header: `X-Username` | 비밀번호 변경 |
| GET | `/api/professor/class-schedules` | Header: `X-Username` | 교수 수업 시간표 전체 조회 |
| GET | `/api/professor/class-schedules?semester=` | Header: `X-Username` | 학기별 수업 시간표 조회 |
| POST | `/api/professor/class-schedules` | Header: `X-Username`, Body: 시간표 정보 | 수업 시간표 등록 |
| PUT | `/api/professor/class-schedules/{id}` | Header: `X-Username`, Body: 수정 정보 | 수업 시간표 수정 |
| DELETE | `/api/professor/class-schedules/{id}` | Header: `X-Username` | 수업 시간표 삭제 |
| GET | `/api/student/class-schedules?semester=` | Header: `X-Username` | 수강신청 기반 내 시간표 조회 |
| GET | `/api/student/enrollments?semester=` | Header: `X-Username` | 수강신청 목록 조회 |
| POST | `/api/student/enrollments` | Header: `X-Username`, Body: `{courseId, semester}` | 수강신청 |
| DELETE | `/api/student/enrollments/{enrollmentId}` | Header: `X-Username` | 수강신청 취소 |
| GET | `/api/admin/super/schools/{id}/tree` | Header: `X-Username` (SUPER_ADMIN) | 학교 전체 트리 조회 |
| POST | `/api/admin/super/schools` | Header: `X-Username`, Body: SchoolTreeDto | 학교 + 계층 일괄 생성 |
| PUT | `/api/admin/super/schools/{id}` | Header: `X-Username`, Body: SchoolTreeDto | 학교 + 계층 Merge 수정 |
| DELETE | `/api/admin/super/schools/{id}` | Header: `X-Username` (SUPER_ADMIN) | 학교 cascade 삭제 |

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

## 9. 더미 데이터 ~~구조~~ → 제거 완료

`DummyDataHelper.java`는 **삭제**되었습니다 (2026-06-03). 공지·게시글은 DB가 비어 있으면 빈 목록을 반환합니다. 모든 데이터는 실 DB(Oracle)에서 직접 조회됩니다.

- 대학 계층 구조는 `DataInitializer`가 최초 실행 시 시딩합니다.
- 교수·학생 Mock 계정은 `ProfessorAccountInitializer`가 시딩합니다.

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

### 인증 기반 "일정" 링크 동적 라우팅

로그인 여부에 따라 "일정" 메뉴의 목적지가 달라집니다.

```ts
const navLinks = rawLinks.map(link =>
  link.label === '일정'
    ? { ...link, to: isLoggedIn ? '/calendar' : link.to }
    : link
)
```

| 로그인 상태 | "일정" 링크 목적지 |
|------------|-------------------|
| 로그인 됨  | `/calendar` (개인 캘린더) |
| 비로그인   | 모드별 원래 경로 (`/dept/schedule`, `/school/schedule`, `/school/faculty/:id/schedule`) |

`isLoggedIn`은 `sessionStorage.getItem('isLoggedIn') === 'true'` OR `localStorage.getItem('auth_isLoggedIn') === 'true'` 로 확인합니다 (`authStorage.ts` 이중 저장소 패턴).

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

### 푸터 — DB 연동

`Footer.tsx`는 하드코딩 없이 URL 또는 `DeptContext`의 `selectedUniversityId`에서 대학 ID를 읽어 `/api/universities/:id`를 호출해 **대학명·설명을 실시간 로드**합니다.

- URL `/universities/2` 형태라면 URL 파싱 우선 → 다른 대학 페이지 이동 시 즉시 업데이트
- URL에 ID 없으면 context 값 fallback
- 대학이 선택되지 않은 상태(`/universities` 목록 페이지 등)에서는 푸터 숨김

> 기존 `data/footerData.ts`(하드코딩 주소·전화·이메일·빈 링크)는 삭제되었습니다.

### Navbar — 현재 위치 breadcrumb (2026-05-30 추가)

URL 기반으로 학교/학부/학과 컨텍스트를 자동 감지하고, 현재 위치를 breadcrumb 형식으로 항상 표시합니다 (모바일 포함).

| 컨텍스트 | 표시 예시 |
|----------|-----------|
| 학교 페이지 | `학과정보통합서비스 › 🏛 국립목포대학교` (클릭 시 대학 홈 이동) |
| 학부 페이지 | `학과정보통합서비스 › 🏛 국립목포대학교 › 🗂 공과대학` |
| 학과 페이지 | `학과정보통합서비스 › 🏛 국립목포대학교 › 🚪 컴퓨터공학과` |

- `DeptContext`에 `selectedFacultyName` 필드 추가 — `FacultyPage`가 학부 데이터 로드 후 `setFacultyName()`으로 저장
- 텍스트 오버플로우 시 `truncate` 처리 (긴 대학명도 깔끔하게 표시)

---

## 12. 인증(로그인·회원가입) 구현 현황

### 현재 구조

인증 기능이 `AuthController` → `AuthService` → `UserRepository` (JPA) 구조로 Oracle DB에 완전히 연동되어 있습니다.

- **회원 저장소:** Spring Data JPA + Oracle 23ai Free. 서버 재시작 후에도 데이터가 유지됩니다.
- **비밀번호:** BCryptPasswordEncoder로 해시 저장. 회원가입, Mock 계정 시딩 모두 적용.
- **세션/토큰:** 별도 JWT 없음. 로그인 성공 시 응답 JSON 반환, 클라이언트가 sessionStorage에 저장하여 이후 요청마다 `X-Username` 헤더로 전송.
- **공지 작성 접근 제어:** `NoticeWritePage`, `SchoolNoticeWritePage`, `FacultyNoticeWritePage`는 마운트 시 `sessionStorage.getItem('memberType')`을 확인합니다. `professor` 또는 `admin`이 아니면 해당 공지 목록 페이지로 즉시 리다이렉트합니다.
- **아이디/비밀번호 찾기 필드:** 전화번호 대신 소속 정보(소속 대학 ID, 단과대 이름, 학번)를 사용합니다. `FindIdPage`: `{name, universityId, college, studentId}`, `FindPasswordPage`: 여기에 `username` 추가.
- **비밀번호 변경:** 로그인 후 `MyPage`에서 현재 비밀번호 확인 후 변경. `POST /api/auth/change-password` (`X-Username` 헤더 + `{currentPassword, newPassword}` body).

### 회원 유형 (memberType)

| 값 | 설명 | grade 저장 여부 |
|----|------|----------------|
| `student` | 일반 학생 | O (1~4학년) |
| `professor` | 교수 | X (null) |
| `employee` | 직원 | X (null) |
| `assistant` | 조교 | X (null) |
| `admin` | 관리자 | X (null) |

> **가입 승인 정책 (2026-05-30 변경):** 모든 회원 유형이 가입 후 `PENDING_APPROVAL` 상태로 시작합니다. 로그인은 승인 후에만 가능합니다. 관리자 신청(`memberType=admin`)은 SUPER_ADMIN이 승인, 일반 사용자(학생·교수 등)는 소속 학교/학과/학부 관리자가 각 관리 대시보드의 "가입 승인" 탭에서 승인합니다.

### 회원가입 유효성 검사 및 보안 (2026-06-03 추가)

**학번/교번 중복 방지**

같은 대학(`universityId`) 내에서 동일한 `studentId`(학번/교번)로 중복 가입할 수 없습니다. `AuthService.signup`에서 `(universityId, studentId)` 조합을 사전 검사하여 중복 시 `400 Bad Request` 반환합니다.

**비밀번호 조건 강화**

| 조건 | 내용 |
|------|------|
| 최소 길이 | 8자 이상 |
| 영문 포함 | 대소문자 최소 1자 이상 |
| 숫자 포함 | 숫자 최소 1자 이상 |
| 특수문자 포함 | `!@#$%^&*` 등 특수문자 최소 1자 이상 |

조건 미충족 시 회원가입 API가 `400 Bad Request`와 구체적인 오류 메시지를 반환합니다.

**학년(`grade`) 처리**

- `student`: 회원가입 시 입력한 학년(1~4)을 그대로 저장합니다.
- `professor`, `assistant`, `employee`, `admin`: grade 값을 `null`로 저장합니다. 조교가 4학년 학생처럼 저장되던 기존 문제가 이 처리로 수정되었습니다.

**조교 계정**

조교는 `memberType=assistant`로 가입하며 교수와 동일하게 교번(`studentId`)을 입력합니다. grade는 null로 처리되고, 마이페이지에서 교번이 표시됩니다.

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
| `Footer.tsx` | 하단 고정 푸터. URL 또는 DeptContext에서 대학 ID를 읽어 `/api/universities/:id`로 대학명·설명 실시간 로드 |
| `DeptContext.tsx` | 선택된 대학/학과/학부 전역 상태, localStorage 동기화. `setFacultyName()` 메서드로 현재 학부명 저장 |
| `useDeptFetch.ts` | fetcher 함수 + id를 받아 데이터 로딩 처리하는 범용 훅 |
| `useInitialRedirect.ts` | 앱 시작 리다이렉트 결정 훅. 로그인 연동 시 `[AUTH_HOOK]` 주석 위치에 주입 |
| `Navbar.tsx` | URL 기반 학교/학부/학과 3모드 자동 전환. 현재 위치를 breadcrumb(`대학 › 학부 › 학과`)으로 항상 표시 — 모바일 포함. 학교 컨텍스트에 "홈" 링크 포함 |
| `UniversityListPage.tsx` | 대학교 카드 목록, 선택 시 학과 선택 페이지로 이동 |
| `UniversityShowPage.tsx` | 대학교 홈. 미니 캘린더 + 다가오는 일정 + 최신 공지 + 인기 게시글 2×2 그리드 (FacultyPage 동일 구조) |
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
| `CalendarPage.tsx` | 개인 캘린더 (`/calendar`). 로그인 사용자 전용. 학생 계정은 수강신청 기반 수업 시간표를 ±3개월 날짜로 확장(readonly)하여 표시 |
| `LoginPage.tsx` | 로그인 폼, `auth.ts`의 `loginApi` 호출 |
| `SignupPage.tsx` | 회원가입 폼 (학생·교수·관리자 선택), `signupApi` 호출 |
| `MyPage.tsx` | 마이페이지 (로그인 사용자 정보 표시, 비밀번호 변경 포함) |
| `FindIdPage.tsx` | 이름·소속 대학 ID·단과대·학번으로 아이디 찾기 |
| `FindPasswordPage.tsx` | 아이디·이름·소속 대학 ID·단과대·학번으로 임시 비밀번호 발급 |
| `auth.ts` | `/api/auth/*` 호출 함수 (login, signup, checkId, findId, findPassword, changePassword) |
| `authStorage.ts` | 로그인 상태 이중 저장소 패턴. `sessionStorage` 우선 → `localStorage`(`auth_` prefix) 폴백. `isLoggedIn()` 공유 함수 제공 |
| `classSchedules.ts` | `ClassScheduleDto` 타입 + `fetchStudentClassSchedules(username, semester)` — `/api/student/class-schedules` 호출 |
| `schedule/ScheduleCalendarView.tsx` | 재사용 캘린더 UI 컴포넌트. `schedules`, `categoryMeta`, `canWrite`, `onSave`, `onDelete` props 받음. CalendarPage·SchedulePage·FacultySchedulePage·SchoolSchedulePage가 공유 |
| `SpaController.java` | `/api/**` 외 모든 경로를 `index.html`로 포워딩 (SPA 새로고침 지원) |
| `MainController.java` | `GET /api/main` (학과 메인), `GET /api/faculty/main` (학부 메인) — 공지5·게시글5·일정 전체·오늘날짜 반환 |
| `AuthController.java` | `POST/GET /api/auth/*` — 로그인·회원가입·아이디/비밀번호 찾기 |
| `AuthService.java` | 인증 비즈니스 로직. DB 연동 시 BCrypt 주석 참고 |
| `User.java` | 회원 엔티티. DB 연동 시 JPA 어노테이션 주석 해제 |
| `UserRepository.java` | 회원 저장소 인터페이스 |
| `UserRepositoryImpl.java` | 인메모리 구현체. DB 연동 시 이 파일 삭제 |
| `GlobalExceptionHandler.java` | 전역 예외 처리 (400/403/404/500 공통 응답 포맷) |
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
|          | `PENDING_APPROVAL` | 가입 승인 대기 — 로그인 차단 (모든 유형) |
|          | `SUSPENDED` | 정지됨 — 로그인 차단 |
|          | `DELETED` | 소프트 삭제 — 로그인 차단 |
| `ADMIN_ROLE` | `SUPER_ADMIN` | 전 시스템 + 모든 학교 관리 |
|              | `SCHOOL_ADMIN` | 자기 학교의 학부/학과/사용자 관리 |
|              | `DEPT_ADMIN` | 자기 학과만 관리 |
|              | `null` | 일반 사용자 |

### 14.2 인증 흐름

1. **회원가입** (`AuthService.signup`)
   - **모든 유형** → `STATUS=PENDING_APPROVAL`, `ADMIN_ROLE=null`
   - 관리자 신청(`memberType=admin`) → SUPER_ADMIN이 승인 + 역할 부여
   - 일반 사용자(`student`/`professor`/`assistant`/`employee`) → 소속 학교·학과·학부 관리자가 해당 대시보드 "가입 승인" 탭에서 승인

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

| 스코프 | 표시되는 페이지 | 허용 역할 | 이동 경로 |
|--------|-----------------|-----------|-----------|
| `selection` | `/universities` | 모든 어드민 | `/admin/super` or `/admin/school/:id` etc |
| `school` | UniversityShowPage / SchoolBoardPage 등 | SUPER, SCHOOL | `/admin/school/:univId` |
| `faculty` | FacultyPage 등 학부 페이지 | SUPER, SCHOOL | `/admin/faculty/:facultyId` |
| `dept` | DepartmentPage / BoardPage 등 | SUPER, SCHOOL, DEPT | `/admin/dept/:deptId` |

`selection` 스코프의 URL 결정 로직:
- SUPER → `/admin/super`
- SCHOOL → `/admin/school/{sessionStorage.universityId}`
- DEPT → `/admin/dept/{sessionStorage.deptId}` (없으면 학교 대시보드로 폴백)

### 14.5 어드민 대시보드 구조

**SuperAdminPage** — "개요 | 학교 관리 | 활동 로그" 3탭 구조

**개요 탭**
- 4-카드 통계 (총 사용자, 7일/30일 신규 가입, 등록 학교)
- 차트 (방문자 추이, 사용자 현황)
- 등록 학교 목록 + 서버 인프라
- **관리자 가입 승인 대기 섹션** — 역할 드롭다운 + 승인/거절
- 관리자 계정 관리 테이블

**학교 관리 탭** (`SchoolManagementTab`)
- 학교 목록 테이블 (ID, 이름, 설명, 편집/삭제 버튼)
- 학교 생성/편집 폼: 이름·설명 + `SchoolTreeEditor`(단과대학→학부→학과 계층 편집)
- 삭제: `window.confirm` 2회 확인 후 cascade 삭제

**활동 로그 탭** (전체 시스템 로그, `GET /api/admin/super/logs`)
- 전체 학교 관리자 액션 최대 200건 시간 역순 표시

**SchoolAdminPage** — 6탭 구조

| 탭 | 내용 |
|----|------|
| 개요 | 통계 카드 + 방문자 라인 차트 + 콘텐츠 비율 도넛 차트 |
| 게시글 관리 | 페이지네이션 + 제목 클릭 이동 + **숨김/표시 토글** + 삭제 |
| 공지 관리 | 페이지네이션 + 제목 클릭 이동 + **숨김/표시 토글** + 삭제 |
| 전체 사용자 | 학교 소속 사용자 + 상태 변경 + 역할 부여 모달 |
| **가입 승인** | `PENDING_APPROVAL` 상태 사용자 목록 (admin 제외). 승인 → `ACTIVE` / 거절 → `DELETED` |
| 교수 배정 | 학과·교수·강의 선택 배정. **다른 소속 교수** 버튼으로 같은 학교 전체 교수 이름 검색 가능 |

**DeptAdminPage** — 8탭 구조

| 탭 | 내용 |
|----|------|
| 개요 | 통계 카드 + 방문자 라인 차트 |
| 학과 페이지 | 일반 DepartmentPage를 embedded 모드로 표시 |
| 게시글 관리 | 페이지네이션 + 제목 클릭 이동 + **숨김/표시 토글** + 삭제 |
| 공지 관리 | 페이지네이션 + 제목 클릭 이동 + **숨김/표시 토글** + 삭제 |
| 사용자 | 학과 소속 사용자 + 상태 변경 |
| **가입 승인** | 해당 학과 소속 `PENDING_APPROVAL` 사용자만 표시. 승인/거절 |
| 통계 | 6개월 월간 바 차트 |
| 교수 배정 | 교수·강의 선택 배정. **다른 소속 교수** 버튼으로 같은 학교 전체 교수 이름 검색 후 선택 가능 |

**FacultyAdminPage** — 7탭 구조

| 탭 | 내용 |
|----|------|
| 개요 | 통계 카드 + 방문자 라인 차트 |
| 학부 페이지 | 일반 FacultyPage를 embedded 모드로 표시 |
| 게시글 관리 | 페이지네이션 + 제목 클릭 이동 + **숨김/표시 토글** + 삭제 |
| 공지 관리 | 페이지네이션 + 제목 클릭 이동 + **숨김/표시 토글** + 삭제 |
| 사용자 | 학부 소속 학과 사용자 통합 표시 + 상태 변경 |
| **가입 승인** | 해당 학부 소속 학과의 `PENDING_APPROVAL` 사용자만 표시. 승인/거절 |
| 통계 | 6개월 월간 바 차트 |

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

모든 상태 변경/역할 부여/승인/거절/숨김 처리는 `AdminLog` 엔티티에 기록됩니다.

| 컬럼 | 설명 |
|------|------|
| `actorUsername` | 액션 수행자 |
| `actionType` | `APPROVE` / `REJECT` / `SUSPEND` / `UNSUSPEND` / `DELETE` / `ROLE_GRANT` / `ROLE_REVOKE` / `HIDE` / `UNHIDE` |
| `targetUsername` | 대상 사용자 (nullable) |
| `detail` | 사람이 읽을 수 있는 설명 |
| `universityId` | 스코프 필터링용 학교 id |
| `createdAt` | 액션 시각 |

**활동 로그 표시 위치:** SuperAdminPage "활동 로그" 탭에서 전체 시스템 로그(최대 200건) 표시. SchoolAdminPage/DeptAdminPage/FacultyAdminPage에는 로그 탭 없음.

### 14.8 게시글/공지 숨김 기능 (2026-05-30 추가)

관리자가 게시글/공지를 숨기면 일반 유저에게 보이지 않지만 복원 가능합니다.

**데이터 모델**
- `POSTS.hidden` / `NOTICES.hidden` — nullable boolean 컬럼 (Oracle 호환. `NULL`은 `false`로 해석)

**동작 방식**

| 대상 | 동작 |
|------|------|
| 일반 유저 조회 | Repository 쿼리에 `(hidden IS NULL OR hidden = false)` 조건 — 숨긴 글 미노출 |
| 관리자 대시보드 | 전체 목록 조회 (숨긴 글 포함) + 숨김 배지 + 투명도 처리 |
| 관리자 상세 페이지 | 게시글/공지 상세 페이지 상단에 관리자 바 노출 (숨김 처리 / 표시 복원 / 삭제) |

**API 엔드포인트**

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `PUT` | `/api/admin/school/posts/{id}/hidden` | 학교 스코프 게시글 숨김 토글 |
| `PUT` | `/api/admin/school/notices/{id}/hidden` | 학교 스코프 공지 숨김 토글 |
| `PUT` | `/api/admin/dept/posts/{id}/hidden` | 학과 스코프 게시글 숨김 토글 |
| `PUT` | `/api/admin/dept/notices/{id}/hidden` | 학과 스코프 공지 숨김 토글 |
| `PUT` | `/api/admin/faculty/posts/{id}/hidden` | 학부 스코프 게시글 숨김 토글 |
| `PUT` | `/api/admin/faculty/notices/{id}/hidden` | 학부 스코프 공지 숨김 토글 |
| `PUT` | `/api/posts/{id}/hidden` | 상세 페이지 직접 숨김 (adminRole 있으면 허용) |
| `PUT` | `/api/notices/{id}/hidden` | 상세 페이지 직접 숨김 |

요청 body: `{ "hidden": true }`

### 14.10 시드 데이터 / 마이그레이션

- `AdminUserInitializer` (`@Order(2)`) — 앱 시작 시 SUPER_ADMIN 시드 계정 자동 생성 (없으면)
- `StatusMigrationRunner` (`@Order(3)`) — 구버전 `APPROVED BOOLEAN` 컬럼을 기준으로 신규 `STATUS` 컬럼 백필. 후속 실행에서는 `ALTER TABLE APP_USERS MODIFY (APPROVED NULL)`을 PL/SQL EXCEPTION 블록으로 idempotent하게 실행해 NOT NULL 제약 제거 (회원가입 시 INSERT에 APPROVED 누락돼도 통과)

### 14.11 관련 설계 문서

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

---

## 16. School CRUD — SUPER_ADMIN 학교 계층 관리 (2026-05-24 추가)

### 16.1 개요

SUPER_ADMIN이 SuperAdminPage "학교 관리" 탭에서 University → CollegeSchool → FacultyGroup → Department 전체 계층을 GUI로 생성·수정·삭제할 수 있습니다.

### 16.2 프론트엔드 구조

```
SuperAdminPage
├── 개요 탭 (기존)
└── 학교 관리 탭 → SchoolManagementTab
      ├── list 뷰  : 학교 테이블 + [편집] [삭제]
      └── form 뷰  : 학교명·설명 + SchoolTreeEditor
                         └── CollegeEditor × n
                               └── FacultyEditor × n
                                     └── DeptRow × n
```

**상태 관리:** `SchoolDraft` (중첩 JSON) 를 로컬에서 편집 → 최종 버튼 클릭 시 단일 API 호출(all-or-nothing).

**TypeScript 타입** (`types/schoolDraft.ts`):

| 타입 | 필드 |
|------|------|
| `SchoolDraft` | name, description, colleges[] |
| `CollegeDraft` | id\|null, name, description, faculties[] |
| `FacultyDraft` | id\|null, name, departments[] (description 없음) |
| `DeptDraft` | id\|null, name, description, phone, email |

**불변 헬퍼** (`utils/schoolDraftHelpers.ts`): `addCollege/removeCollege/updateCollege`, `addFaculty/removeFaculty/updateFaculty`, `addDept/removeDept/updateDept` — 모두 순수 함수(spread 기반).

### 16.3 백엔드 구조

**SchoolCrudService.java** — 핵심 로직:

| 메서드 | 설명 |
|--------|------|
| `getTree(univId)` | University → College → Faculty → Dept 전체 트리 조회 후 SchoolTreeDto 반환 |
| `createSchool(req)` | `@Transactional` — University → CollegeSchool → FacultyGroup → Department 순차 저장 |
| `updateSchool(univId, req)` | `@Transactional` — Merge 전략: 요청에 없는 기존 id는 cascade 삭제, id=null은 신규 생성, id 일치는 업데이트 |
| `deleteSchool(univId)` | `@Transactional` — 하위 데이터 전체 cascade 삭제 + 소속 사용자 universityId null화 |

**Cascade 삭제 순서** (`deleteDeptCascade` → `deleteFacultyCascade` → `deleteCollegeCascade`):
1. ClassSchedule, Enrollment, ProfessorCourseAssignment, CurriculumItem, Professor 삭제
2. "dept"/"faculty"/"univ" scope Notice·Post·Schedule 삭제 (`"univ"` scopeId = CollegeSchool.id, University.id 아님)
3. Department → FacultyGroup → CollegeSchool → University 삭제
4. 소속 사용자 universityId → null (계정 삭제 아님)

**SchoolTreeDto.java** — CollegeDto·FacultyDto·DeptDto 내부 static 클래스 포함. FacultyDto에 description 없음 (FacultyGroup 엔티티 제약).

### 16.4 API 엔드포인트

모두 `X-Username` 헤더 + SUPER_ADMIN 역할 필요.

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/admin/super/schools` | 학교 목록 (id, name, description) |
| GET | `/api/admin/super/schools/{id}/tree` | 학교 전체 트리 (수정 폼 초기화) |
| POST | `/api/admin/super/schools` | 학교 + 계층 일괄 생성 → 201 `{id}` |
| PUT | `/api/admin/super/schools/{id}` | Merge 수정 → 204 |
| DELETE | `/api/admin/super/schools/{id}` | Cascade 삭제 → 204 |

### 16.5 관련 설계 문서

- `docs/superpowers/specs/2026-05-24-school-crud-design.md` — 전체 설계 스펙
- `docs/superpowers/plans/2026-05-24-school-crud.md` — 12-Task 구현 계획

---

## 17. 일정 시스템 통합 (2026-05-30 추가)

### 17.1 /calendar 라우팅 분기 (CalendarRouter)

`App.tsx`의 `CalendarRouter` 컴포넌트가 로그인 상태를 **reactive하게** 감지하여 목적지를 결정합니다.

| 로그인 상태 | `/calendar` 접속 결과 |
|------------|----------------------|
| 로그인 됨  | `CalendarPage` — 개인 캘린더 |
| 비로그인   | `SchedulePage` — 현재 선택된 학과 일정 |

> `CalendarRouter`는 `loginChanged` / `storage` 이벤트를 구독하여 탭 간 로그인/로그아웃 시에도 즉각 반응합니다.

### 17.2 CalendarPage — 권한별 일정 표시 (2026-06-03 개선)

로그인한 사용자의 `memberType`에 따라 표시되는 일정과 작성 가능한 일정 유형이 다릅니다.

**표시 일정 소스:**
- DB 일정 (`GET /api/schedules/my`) — 사용자가 직접 등록한 통합 일정
- 시간표 이벤트 (`fetchMyTimetable`) — 수강 중인 강좌의 반복 수업 (읽기 전용)
- 학과 이벤트 (`fetchStudentDeptEvents`) — 학과 공지성 일정 (읽기 전용)
- 담당 과목 이벤트 (`fetchStudentCourseEvents`) — 교수가 등록한 시험·과제 이벤트

**권한별 일정 작성 가능 유형:**

| 권한 | 작성 가능한 일정 유형 |
|------|----------------------|
| 학생 | 개인 일정, 학과 공지, 학교 공지 |
| 교수 | 개인 일정, 과목 이벤트(시험·과제), 학과 공지, 학년 공지, 학교 공지 |
| 조교 | 학생과 유사 + 과목 선택 가능 |
| 관리자 | 전체 유형 |

**ScheduleCalendarView 컴포넌트 기능 (2026-06-03 대폭 개선):**
- 월간 / 주간 / 일간 뷰 전환
- 실시간 검색 + 카테고리 필터
- 오늘의 일정 전용 섹션
- 권한 기반 수정·삭제 제어 (작성자 본인 + 관리자만 가능, 수업 시간표는 읽기 전용)

### 17.3 MainPage — 로그인 여부에 따른 일정 표시

| 섹션 | 비로그인 | 로그인 |
|------|---------|-------|
| **달력** | 현재 선택된 학과 일정 (API) | 개인 일정 + 소속 학과·학부·학교 일정 통합 |
| **다가오는 일정** | 학과 일정 (API, 최대 8개) | 개인 일정 + 소속 일정 통합, 날짜 오름차순, 최대 8개 |
| **인기 게시글** | 🔒 로그인 필요 | 표시 |
| **최신 공지사항** | `isPublicToOutsiders=true`인 것만 | 전체 표시 |
| **일정 더보기 링크** | `/dept/schedule` | `/calendar` |

**소속 일정 소스:**
- `/api/schedules?deptId={userDeptId}` — 학과 일정
- `/api/faculty/schedules?facultyId={userFacultyId}` — 학부 일정
- `/api/univ/schedules?univId={userUnivId}` — 학교 일정
- `/api/student/dept-events?deptId={userDeptId}` — 교수 등록 학과 이벤트

> `userDeptId`가 없으면 현재 `selectedDeptId`(보고 있는 학과)로 폴백합니다.

### 17.4 Navbar "일정" 링크 동적 라우팅

```ts
// Navbar.tsx — buildDeptNav
{ to: loggedIn ? '/calendar' : '/dept/schedule', label: '일정' }
```

`isLoggedInState`는 `loginChanged` / `storage` 이벤트로 reactive하게 갱신됩니다.

### 17.5 일정 등록 권한 및 공개 범위 규칙 (2026-06-03 추가)

일정 등록 시 `scheduleType`에 따라 공개 범위가 결정됩니다. 모든 일정은 통합 일정 API(`POST /api/schedules`) 기준으로 등록됩니다.

**일정 유형별 공개 범위**

| scheduleType | 저장 기준 | 표시 대상 |
|-------------|----------|----------|
| `personal` | `ownerId` (작성자 본인) | 본인만 |
| `dept` (학과 일정) | `departmentId` | 같은 학과 사용자 전체 |
| `faculty` (학부 일정) | `facultyId` | 같은 학부 사용자 전체 |
| `university` (학교 일정) | `universityId` | 같은 학교 사용자 전체 |
| `course` (과목 일정) | `courseId` | 해당 과목 수강생 또는 담당 교수 |
| `announcement` (전체 공지) | `departmentId` (교수/조교의 소속 학과) | 해당 학과 학생 전체 |

> 기존에 개인 일정이 다른 사용자에게도 보이던 문제는 `personal` 타입에 `ownerId` 필터를 추가하여 수정되었습니다.
> 교수/조교의 전체 공지는 전체 학과가 아닌 **소속 학과 학생에게만** 표시됩니다.

**과목 일정 등록**

과목 일정은 DB에 저장된 `PROF_COURSE_ASSIGNMENTS`(담당 과목) 또는 `ENROLLMENTS`(수강 과목) 기준으로만 선택 가능합니다. 교수/조교는 담당 과목 목록에서 선택하고, 학생은 수강 과목 목록에서 선택합니다.

**과목 없이 공지성 일정 등록**

교수/조교는 과목을 선택하지 않고도 `announcement`(전체 공지), `dept`(학과 일정), `university`(학교 일정) 타입으로 일정을 등록할 수 있습니다. 기존에 과목 선택이 필수였던 구조를 개선하여 공지성 일정 등록이 가능해졌습니다.

**일정 수정·삭제 권한**

일정 클릭 시 상세 보기가 열리며, **작성자 본인에게만** 수정·삭제 버튼이 표시됩니다. 백엔드에서도 `ownerId` 또는 `createdBy` 검증을 통해 권한 없는 수정/삭제 요청에 `403 Forbidden`을 반환합니다.

---

## 18. MyPage 기능 확장 (2026-05-30 추가)

### 18.1 탭 구성

| 탭 | 표시 조건 | 내용 |
|----|----------|------|
| 내 정보 | 모든 유저 | 이름 수정, 비밀번호 변경, 회원 탈퇴 |
| **수업 선택** | 학생(`student`)만 | 수강신청 관리 (학과 ID 입력 → 과목 조회 → 추가/취소) |
| 내가 쓴 글 | 모든 유저 | 작성한 게시글 목록. **수정·삭제** 기능 (hover 시 표시) |
| 댓글 관리 | 모든 유저 | 작성한 댓글 목록. **인라인 수정·삭제** 기능 |
| 내 일정 관리 | 모든 유저 | 목록/달력 뷰, 필터·검색, 추가·수정·삭제 |
| 알림 설정 | 모든 유저 | 공지/댓글/D-Day 알림 on/off |

**학번/교번 표시 (2026-06-03 추가)**

"내 정보" 탭에서 회원 유형에 따라 학번 또는 교번이 표시됩니다.

| 회원 유형 | 표시 항목 | 데이터 소스 |
|----------|----------|------------|
| `student` | 학번 | 로그인 응답 또는 `GET /api/auth/me` 의 `studentId` 필드 |
| `professor` | 교번 | 로그인 응답 또는 `GET /api/auth/me` 의 `studentId` 필드 |
| `assistant` | 교번 | 로그인 응답 또는 `GET /api/auth/me` 의 `studentId` 필드 |

> `studentId` 필드는 회원 유형에 따라 학번 또는 교번으로 의미가 다르며, 마이페이지에서는 역할에 맞는 레이블("학번" / "교번")로 표시됩니다.

### 18.2 수업 선택 탭 (학생 전용)

- `GET /api/courses?deptId=X` — 학과 과목 목록 조회
- `GET /api/student/enrollments?semester=` — 현재 수강 과목 조회
- `POST /api/student/enrollments` — 수강신청
- `DELETE /api/student/enrollments/{enrollmentId}` — 수강 취소

---

## 19. 회원가입 — API 기반 대학·학과 로딩 (2026-05-30 변경)

기존의 하드코딩된 `COLLEGES`/`DEPARTMENTS` 상수 배열을 제거하고, 실제 API를 호출합니다.

| 단계 | 데이터 소스 |
|------|------------|
| Step 1 — 대학교 선택 | `GET /api/universities` → 전체 대학 목록 동적 로드 |
| Step 3 — 단과대 선택 | `GET /api/universities/{selectedUnivId}` → 선택된 대학의 schools 목록 |
| Step 3 — 학과 선택 | 선택된 단과대의 faculties → depts 목록 |

> `universityId` 페이로드에 실제 숫자 ID(`String(selectedUnivId)`)가 저장되어 DB 조회와 정확히 일치합니다. (이전: `"mokpo"`, `"suncheon"` 등 임의 문자열 → 조회 오류)

---

## 20. 교수 배정 — 타 소속 교수 지원 (2026-05-30 추가)

### 20.1 변경 사항

**백엔드** (`AdminService.createAssignment`): 교수의 소속 학과(`prof.getDeptId()`)가 배정 대상 학과(`deptId`)와 같아야 한다는 검증을 제거했습니다. 강의의 소속 학과만 검증합니다.

**프론트엔드** 교수 배정 폼:
- 교수 select 오른쪽에 **"다른 소속 교수"** 버튼 추가
- 클릭 시 같은 학교의 전체 교수를 이름으로 검색하는 인라인 패널 표시
- 선택 시 select에 자동 반영, 패널 닫힘

### 20.2 API

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /api/admin/dept/univ-professors` | 해당 학과가 속한 대학의 전체 교수 목록 (DeptAdminPage용) |
| `GET /api/admin/school/professors` | 학교 전체 교수 목록 (SchoolAdminPage용, 기존 엔드포인트) |

---

## 21. 학교·학과 페이지 콘텐츠 편집 (2026-06-03 추가)

### 21.1 SchoolInfoPage 편집

`SchoolInfoPage`에 인라인 편집 기능이 추가되었습니다. SCHOOL_ADMIN 이상 권한을 가진 사용자는 학교 소개·시설·FAQ·빠른링크 등 각 섹션을 직접 편집할 수 있습니다.

**구조:**
- `SchoolEditContext.tsx` — 편집 모드 상태 + `saveSection(section, value)` 제공
- `SchoolEditableSection.tsx` — 편집/미리보기 토글 래퍼
- `SchoolHeroForm`, `SchoolContactForm`, `SchoolFacilitiesForm`, `SchoolFaqsForm`, `SchoolGuideCardsForm`, `SchoolQuickLinksForm` — 섹션별 편집 폼

**백엔드:**
- `SchoolPageContent` 엔티티 (`SCHOOL_PAGE_CONTENT` 테이블) — univId를 PK로 학교별 콘텐츠 JSON 저장
- `SchoolContentService.java` — DB 저장/조회 로직
- `SchoolAdminController` — `PUT /api/admin/school/content/{section}` 엔드포인트

### 21.2 DepartmentPage 편집 폼 추가

- `CommunityTopicsForm.tsx` — 커뮤니티 태그 편집
- `CurriculumForm.tsx` — 교육과정 편집
- `ProfessorForm.tsx` — 교수 정보 편집

### 21.3 통합 시간표 페이지 (TimetablePage) — 2026-06-03 대폭 개선

`/timetable` 경로. 비로그인 시 접근 안내 표시. 로그인 권한별로 3가지 뷰로 분기됩니다.

**학생 뷰:**
- 강좌 검색 + 수강신청 (시간 충돌 자동 감지)
- 시간표 표시: ClassSchedule 우선 → 없으면 LectureOffering.lectureTime 파싱 폴백
- 개인 일정 병합 표시

**교수 뷰:**
- 담당 강좌 목록 조회 (`fetchProfessorAssignments`)
- 강좌별 수업 시간표 등록·수정·삭제

**관리자 뷰:**
- 학과 범위 선택 후 배정 강좌 시간 관리
- 교수-강좌 배정별 시간 편집 (생성/수정/삭제)
- 검색·상태·정렬 필터 제공

**classSchedules.ts 주요 API 함수:**

| 함수 | 설명 | 대상 |
|------|------|------|
| `fetchStudentClassSchedules` | 학생 수업 시간표 | 학생 |
| `fetchStudentCourseEvents` | 담당 과목 이벤트(시험·과제) | 학생 |
| `fetchStudentDeptEvents` | 학과 공지 일정 | 학생 |
| `fetchProfessorAssignedCourses` | 교수 배정 과목 목록 | 교수 |
| `fetchProfessorClassSchedules` | 교수 등록 시간표 | 교수 |
| `createClassSchedule` / `updateClassSchedule` / `deleteClassSchedule` | 교수 시간표 CRUD | 교수 |
| `fetchAdminClassSchedules` | 관리자 범위 시간표 | 관리자 |
| `fetchAssistantCourses` | 조교 소속 학과 과목 | 조교 |

---

## 22. 비로그인 공지 표시 일관성 수정 (2026-06-03)

`MainPage`의 공지 표시 기준을 `NoticePage`와 통일했습니다.

| 이전 | 수정 후 |
|------|--------|
| `loggedIn` → 로그인만 되면 모든 공지 표시 | `isMember` → 해당 학과 소속 로그인만 모든 공지 표시 |

비소속 로그인 사용자도 비로그인과 동일하게 `isPublicToOutsiders=true` 공지만 표시됩니다.
