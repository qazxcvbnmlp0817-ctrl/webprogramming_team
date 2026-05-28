# Prompt History

> Claude reads this file at session start to recall prior instructions and context.
> Latest entries go at the top.

---

## [2026-05-22] 관리자 시스템 — 가입 승인 + Dept/Faculty 어드민 대시보드

### 완료 작업

**Issue 1 — 관리자 가입 승인 흐름**
- `AuthService.signup()`이 `memberType='admin'` 신청 시 `status='PENDING_APPROVAL'`로 저장하지만 `adminRole=null`이라 기존 `findByAdminRoleIsNotNull()` 쿼리에 안 잡히던 문제 해결
- `UserRepository.findByStatusAndMemberType()` 추가 — pending admin 신청 전용 쿼리
- `AdminService.getPendingAdmins()`, `approveAdmin(id, approve, role, actor)` 추가
  - 승인 시 status=ACTIVE + adminRole 동시 부여 + ADMIN_LOGS에 APPROVE 기록
  - 거절 시 status=DELETED + REJECT 기록
- `SuperAdminController`에 `GET /pending-admins`, `PUT /users/{id}/approve-admin` 추가
- `SuperAdminPage`에 "관리자 가입 승인 대기" 섹션 추가 (역할 드롭다운 + 승인/거절 + 카운트 배지)
- 학교 어드민의 가입 승인 목록에서 `memberType='admin'` 제외 → 역할 부여는 SUPER_ADMIN 전담

**Issue 2 — 학교/학과 관리자 진입 동선 확보**
- `AdminBanner.selection` 스코프를 SUPER_ADMIN 외에 SCHOOL_ADMIN, DEPT_ADMIN에도 허용
- 클릭 시 역할별 라우팅 — SUPER → `/admin/super`, SCHOOL → `/admin/school/{universityId}`, DEPT → `/admin/dept/{deptId}`
- `LoginPage`가 응답에 포함된 `deptId`를 `sessionStorage`에 저장 (DEPT_ADMIN 진입 동선용)
- `AuthService.login()`이 DEPT_ADMIN 사용자의 deptId를 `(universityId, department)` 이름 매칭으로 resolve해 응답에 포함

**Issue 3 — Dept/Faculty 관리자 대시보드**
- 신규 컨트롤러: `DeptAdminController` (`/api/admin/dept`), `FacultyAdminController` (`/api/admin/faculty`)
  - `resolveDeptId` / `resolveFacultyId`로 SUPER / SCHOOL / DEPT_ADMIN 역할별 스코프 해결
  - SCHOOL_ADMIN은 본인 학교 소속 dept/faculty만, DEPT_ADMIN은 본인 학과만 접근
  - FacultyAdminController는 DEPT_ADMIN 차단 (학부는 학과 상위 스코프)
- `AdminService`에 dept-scope 9개 + faculty-scope 9개 메서드 추가
- `getScopedPosts`, `getScopedNotices` 헬퍼로 univ/dept/faculty 공통 페이지네이션 처리
- `NoticeRepository`에 `findByScopeTypeAndScopeId(..., Pageable)` 추가
- 프론트엔드:
  - `adminDept.ts`, `adminFaculty.ts` — adminSchool.ts와 동일 shape
  - `DeptAdminPage.tsx` 완전 재작성 — 6탭 (개요 / 학과 페이지 / 게시글 관리 / 공지 관리 / 사용자 / 통계)
  - `FacultyAdminPage.tsx` 신규 — 동일 패턴, 학부 스코프
  - `DepartmentPage.tsx`, `FacultyPage.tsx`에 `embedded` prop 추가 — Navbar/AdminBanner/InfoReportModal 숨김
  - 학과 페이지 / 학부 페이지 탭은 일반 페이지 컴포넌트를 embedded 모드로 임베드
  - 글쓰기/공지 작성 버튼은 DeptContext 설정 후 기존 `/dept/board/write`, `/dept/notice/write` 라우트로 이동
- `App.tsx`: `/admin/faculty/:id` 라우트 + `ProtectedFacultyAdmin` 가드 추가
- 디자인/구현 명세: `docs/superpowers/specs/2026-05-22-dept-faculty-admin-design.md`
- 구현 계획: `docs/superpowers/plans/2026-05-22-dept-faculty-admin.md`

**버그 수정**
- `User` 엔티티에서 `approved` 필드 제거 후 회원가입 시 `ORA-01400: NULL을 APPROVED에 삽입할 수 없습니다` 발생
  - 원인: Hibernate `ddl-auto=update`는 컬럼 추가만 하고 제약 변경/삭제는 안 함. Oracle의 기존 `APPROVED NOT NULL` 제약 살아있음.
  - 해결: `StatusMigrationRunner`에 `ALTER TABLE APP_USERS MODIFY (APPROVED NULL)`을 PL/SQL EXCEPTION 블록으로 감싸 idempotent하게 실행 (ORA-01451/00904 Oracle 레벨에서 swallow)
- `User.status` 컬럼 추가 시 `ORA-01758: DEFAULT 없는 NOT NULL 컬럼 추가 불가` 발생
  - 해결: `@Column(nullable=false)` → `@Column`으로 변경. StatusMigrationRunner가 기존 APPROVED 값에서 ACTIVE/PENDING_APPROVAL로 백필

### 현재 실행 상태
- Spring Boot: `http://localhost:8080`
- 새 정적 자산: `index-B8M2oz_-.css` / `index-B8PuYW1q.js`
- 12개 신규 어드민 엔드포인트 모두 X-Username 가드 통과 (403 unauth → 200 with auth)

### 다음 작업 (Issue 4)
- "UI는 있는데 백엔드/프론트 로직이 누락된 기능" 명세화 필요 — 페이지/버튼 단위로 구체화하면 일괄 처리

---

## [2026-05-20] Oracle DB 연동 + 전체 백엔드 완성

### 완료 작업

**Oracle DB 연동**
- Oracle 23ai Free (로컬, `freepdb1`) 연결
- `dept_user` 계정에 `CREATE SESSION` 권한 부여로 접속 문제 해결
- `application-secret.properties`에 DB 접속 정보 분리 (git 커밋 금지)

**엔티티 / DB 테이블 (10개)**
- `APP_USERS` — 회원 (username, password BCrypt, name, memberType, universityId, college, department, studentId, phone, grade, approved)
- `NOTICES` — 공지사항 (scopeType: dept/faculty/univ, scopeId)
- `POSTS` — 게시글 (targetGrades 콤마 구분 문자열, visibility)
- `SCHEDULES` — 일정
- `UNIVERSITIES`, `COLLEGE_SCHOOLS`, `FACULTY_GROUPS`, `DEPTS` — 대학 계층 구조
- `PROFESSORS`, `CURRICULUM_ITEMS` — 학과 세부 정보

**DataInitializer**
- 앱 최초 실행 시 목포대학교 (6단과대·7학부·18학과) + 순천대학교 (2단과대·2학부·4학과) 자동 시드
- 각 학과마다 교수 3명 + 교육과정 6개 삽입

**BCrypt 암호화 활성화**
- `spring-security-crypto` 의존성 추가 (Spring Security 필터 없이 암호화만)
- `AuthService`: 회원가입 시 `encode()`, 로그인 시 `matches()`, 비밀번호 찾기 시 임시 비번 생성 후 저장

**공지·게시글 작성 API**
- `POST /api/notices`, `/api/faculty/notices`, `/api/univ/notices`
- `POST /api/posts`, `/api/faculty/posts`, `/api/univ/posts`
- 프론트 글쓰기 페이지들 모두 실제 API 호출로 연결

**SpaController 경로 전수 등록**
- 학부 하위 경로 (`/school/faculty/{facultyId}/…`), 글쓰기 경로, `/dept/home` 등 누락 경로 추가

**SignupPage.tsx 버그 수정**
- 회원가입 폼이 API를 호출하지 않던 버그 수정 → `signupApi` 실제 호출로 교체
- `auth.ts` `signupApi` 함수에 `phone`, `grade` 필드 추가

### 현재 실행 상태
- Spring Boot: `http://localhost:8080` (포트 8080)
- Oracle DB 연결 완료, 모든 테이블 자동 생성됨
- 프론트엔드 빌드 → `demo/demo/src/main/resources/static/`에 배포

---

## [2026-05-14] React SPA 마이그레이션

- Spring Boot + Thymeleaf → Vite + React + TypeScript SPA 전환
- `frontend/` 디렉토리에 Vite 프로젝트 생성
- DeptContext (localStorage: `selectedDeptId`, `selectedUniversityId`)로 전역 학과 상태 관리
- SessionStorage: `memberType`, `name`, `username`, `grade` (로그인 시 저장)
- Vite proxy로 개발 환경 CORS 우회
- 빌드 시 `static/`에 자동 배포

---

## [2026-05-13] 대학 선택 랜딩 페이지

- 대학 목록 → 단과대학 선택 → 학과 선택 흐름 구현
- UniversityListPage, UniversityShowPage, SchoolDepartmentsPage 추가

---

## [2026-05-11] 공지사항·게시판 설계

- 공지사항·게시판·일정·학과정보 페이지 구조 설계
- 필터탭, 페이지네이션, 사이드바 컴포넌트 설계

---

## [2026-05-11] Project Setup — Department Info Integration Site

### Stack
- Backend: Spring Boot
- DB: Oracle AI Database (credentials in `application-secret.properties`, gitignored)
- VCS: Git (team collaboration)

### Project Goal
학과·학부·대학의 공지사항·게시판·일정·학과정보를 한 곳에서 확인할 수 있는 통합 포털.

### Rules
- DB 접속 정보는 별도 파일로 분리, git에 절대 커밋 금지
- `application-secret.properties` 는 반드시 `.gitignore`에 포함
