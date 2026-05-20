# Prompt History

> Claude reads this file at session start to recall prior instructions and context.
> Latest entries go at the top.

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
