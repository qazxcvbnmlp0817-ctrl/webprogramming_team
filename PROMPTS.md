# 프롬프트 단계별 정리

> 세션마다 작성한 지시사항을 단계별로 누적 기록한 파일입니다.  
> Claude는 세션 시작 시 이 파일을 읽어 이전 컨텍스트를 복원합니다.  
> **최신 항목이 상단에 위치합니다.**

---

## Phase 16 — 문서 전체 업데이트 [2026-05-28]

### 지시사항
- `서버켜줘` — 백엔드(8080) + 프론트(5173) 이미 실행 중 확인
- `문서업데이트해줘` → DB_SETUP_GUIDE.md + frontend/README.md 갱신
- `다른 문서파일들 업데이트해줘` → plan 17개 체크박스 완료 표시
- `git push까지 동작해줘` → 커밋 + push 완료

### 완료 내용
- `docs/DB_SETUP_GUIDE.md`: 날짜 05-28, 엔티티 15→20개, 테이블 5개 추가(COMMENTS, NOTICE_COMMENTS, NOTICE_ATTACHMENTS, POST_ATTACHMENTS, POST_LIKES), 대댓글/RBAC/인기글 구현 현황 반영
- `frontend/README.md`: Vite 기본 템플릿 → 프로젝트 맞춤(기술 스택, 실행법, 주요 페이지, 역할 구조)으로 교체
- `docs/superpowers/plans/` 17개 파일: `- [ ]` → `- [x]` 일괄 완료 (총 565개 체크박스)
- 미추적 doc 4개 신규 커밋(2026-05-21 admin-nav-button, 2026-05-24 teammate-calendar-merge, professor-course-assignment 등)

---

## Phase 15 — 대댓글(Nested Comment) 기능 [2026-05-28]

### 지시사항
- 게시글 댓글과 공지 댓글에 대댓글(1단계) 기능 추가

### 완료 내용
- `Comment`, `NoticeComment` 엔티티에 `parentId` 필드 추가 (`null`=원댓글, `not null`=대댓글)
- `CommentService`: parentId 저장, 1단계 중첩 검증(대댓글의 대댓글 불가), 부모 삭제 시 자식 cascade
- `PostDetailPage.tsx`, `NoticeDetailPage.tsx`: 들여쓰기 UI, 답글 달기 토글 폼 추가
- cross-post 검증, double-li, startEdit 충돌, NPE 버그 수정 및 프론트엔드 빌드 갱신

---

## Phase 14 — Role Hierarchy Modal + RBAC 완성 [2026-05-27]

### 지시사항
- 역할 계층 검증(SCHOOL_ADMIN > DEPT_ADMIN) 및 모달 기반 역할 관리 UI
- admin 계정 최소 역할 보장, 학과/학부 접근 범위 배너

### 완료 내용
- `AdminService.updateUserRole()` + `roleLevel()` 헬퍼: 상위→하위 강등 시 422, admin 계정 역할 박탈 시 422
- `AdminServiceRoleTest.java` 4개 테스트 (TDD)
- `RoleManageModal.tsx` 신규: 라디오 버튼 역할 선택, 변경 없으면 저장 비활성, 에러 인라인 표시, aria-modal
- `SchoolAdminPage.tsx`: 인라인 드롭다운 → "역할 관리" 버튼 + RoleManageModal 교체
- `DeptAdminPage.tsx`, `FacultyAdminPage.tsx`: sessionStorage.department/college 기반 접근 범위 배너 추가
- `AdminBanner.tsx`: 비소속 페이지에서 관리자 배너 숨김 처리
- 역할별 관리자 버튼 조건부 렌더링 (SCHOOL_ADMIN 2개, DEPT_ADMIN 1개)

---

## Phase 13 — Multi-role 관리 + RBAC 진입 동선 [2026-05-27]

### 지시사항
- School Admin이 교수/조교에게 SCHOOL_ADMIN 역할도 부여 가능하도록
- 역할 부여된 사용자가 교수 기능 + 관리자 대시보드 동시 접근

### 완료 내용
- `SchoolAdminController` 권한 완화: `DEPT_ADMIN만` → `SUPER_ADMIN 제외 모두` 허용
- `SchoolAdminPage` "전체 사용자" 탭: 인라인 역할 드롭다운 추가
- "관리자 계정" 탭: memberType 뱃지 + adminRole 함께 표시
- `SchoolAdminRoleControllerTest.java` 4개 테스트

---

## Phase 12 — Main Page 기능 개선 [2026-05-27]

### 지시사항
- 메인페이지 공지사항 카테고리 필터(localStorage 영속)
- 인기 게시글 TOP5(좋아요 순) 표시
- 공지/게시글 클릭 시 상세 페이지 직접 이동

### 완료 내용
- `PostRepository`: 좋아요 내림차순 정렬 쿼리 메서드 추가
- `PostService`: `getTopPostsByLikesForDept/Faculty(limit)` 추가
- `MainController /api/main`: notices 전체 반환, posts 좋아요 TOP5 반환
- `MainPage.tsx`: NOTICE_TABS 5개 필터 버튼, localStorage 사용자별 키 영속, 아이템 클릭 navigate
- 인기글 가중치 정렬·표시 수 확대, 관리자 UI 개선

---

## Phase 11 — 교수 배정 관리 + 팀원 병합 [2026-05-24]

### 지시사항
- 교수-강좌 배정 관리 탭 추가
- 팀원 캘린더 코드 병합

### 완료 내용
- `ProfessorCourseAssignment` 엔티티 + Repository 추가 (PROF_COURSE_ASSIGNMENTS 테이블)
- `AdminService`: professor/course/assignment 서비스 메서드 추가, N+1 쿼리 수정
- `DeptAdminController`, `SchoolAdminController`: 교수/강의/배정 엔드포인트 5개 추가
- `DeptAdminPage`, `SchoolAdminPage`: "교수 배정" 탭 추가
- `CalendarPage.tsx`: 개인 일정 localStorage 기반 캘린더, ScheduleFormModal 종료 시간 입력
- `ScheduleCalendarView` 공유 컴포넌트로 팀원 UI 통합
- `ProfessorAccountInitializer (@Order 5)`: 교수/학생 Mock 계정 + 수강신청 + 수업 시간표 자동 시딩

---

## Phase 10 — School CRUD (Super Admin) [2026-05-24]

### 지시사항
- SUPER_ADMIN이 대학·단과대·학부·학과 계층 전체를 생성·수정·삭제할 수 있는 관리 기능

### 완료 내용
- `SchoolTreeDto`: 계층 응답 DTO
- `SchoolCrudService`: `getTree`, `createSchool`, `updateSchool`(Merge 전략), `deleteSchool`(cascade — 교수·수업·수강신청·공지 모두 제거)
- `SuperAdminController`: `GET /api/admin/super/schools`, `POST`, `PUT /{id}`, `DELETE /{id}`
- `SchoolManagementTab.tsx`: list/create/edit 뷰 + API 연동
- `SchoolTreeEditor.tsx`: 단과대·학부·학과 계층 인라인 에디터
- `adminSuper.ts`: fetchSchoolTree, createSchool, updateSchool, deleteSchool

---

## Phase 9 — 인트로 애니메이션 + 대학 목록 개선 [2026-05-23]

### 지시사항
- 앱 진입 시 인트로 애니메이션 (세션당 1회)
- 대학교 목록 카드 개선: 검색/정렬, 활동 점수, 호버 프리뷰

### 완료 내용
- `IntroAnimation.tsx`: 세션 기반 페이드인 애니메이션 (onComplete useRef 패턴)
- `App.tsx`: sessionStorage 기반 인트로 분기
- `UniversityCard.tsx`: activityScore 계산, 호버 프리뷰 패널 (주간 게시글·공지·방문자)
- `UniversityListPage.tsx`: 검색/정렬 + 카드 분리 적용
- 주간 활동 지표 집계 버그 수정 (30일 맵 집계 로직)

---

## Phase 8 — 관리자 시스템 v2 (Dept/Faculty Admin 대시보드) [2026-05-22]

### 지시사항
- 관리자 가입 승인 흐름 완성
- Dept / Faculty 관리자 대시보드 추가
- 모든 역할(SUPER/SCHOOL/DEPT)의 관리자 진입 동선 확보

### 완료 내용

**관리자 가입 승인**
- `AuthService.signup()`: memberType='admin' → status='PENDING_APPROVAL'
- `UserRepository.findByStatusAndMemberType()` 추가
- `AdminService`: `getPendingAdmins()`, `approveAdmin(id, approve, role, actor)`
- `SuperAdminController`: `GET /pending-admins`, `PUT /users/{id}/approve-admin`
- `SuperAdminPage`: 승인 대기 섹션 + 역할 드롭다운 + 승인/거절

**진입 동선**
- `AdminBanner`: SUPER/SCHOOL/DEPT 역할별 라우팅 (selection 스코프 확장)
- `LoginPage`: 응답 deptId를 sessionStorage에 저장
- `AuthService.login()`: DEPT_ADMIN deptId를 universityId+department 매칭으로 resolve

**Dept/Faculty Admin 대시보드**
- `DeptAdminController` (`/api/admin/dept`): resolveDeptId로 역할별 스코프 해결
- `FacultyAdminController` (`/api/admin/faculty`): DEPT_ADMIN 차단
- `AdminService`: dept/faculty 스코프 메서드 9+9개, scoped post/notice 페이지네이션
- `DeptAdminPage.tsx`: 6탭 (개요/학과 페이지/게시글/공지/사용자/통계)
- `FacultyAdminPage.tsx`: 동일 패턴, 학부 스코프
- `DepartmentPage.tsx`, `FacultyPage.tsx`: `embedded` prop 추가 (Navbar/AdminBanner 숨김)

**버그 수정**
- `APPROVED NOT NULL` 제약: StatusMigrationRunner에 `ALTER TABLE MODIFY (APPROVED NULL)` idempotent 추가
- `User.status` NOT NULL 제약: `@Column(nullable=false)` → `@Column` 변경

---

## Phase 7 — 관리자 시스템 v1 (Admin Dashboard) [2026-05-21~22]

### 지시사항
- Super Admin / School Admin 역할 기반 대시보드 설계 및 구현

### 완료 내용
- `AdminBanner.tsx`: 관리자 진입 버튼 (역할 감지)
- `AdminNavButton`: 관리자 버튼 조건부 렌더링
- `SuperAdminController`, `SchoolAdminController`: RBAC `/api/admin/super/**`, `/api/admin/school/**`
- `AdminService`: super/school 어드민 비즈니스 로직
- `SuperAdminPage.tsx`: 차트 + 역할 관리 대시보드
- `SchoolAdminPage.tsx` v1: 6탭 대시보드 (개요/사용자/게시글/공지/통계/역할)
- `VisitInterceptor`: PAGE_VISITS 방문자 추적
- `PageVisit` 엔티티 + Repository

---

## Phase 6 — Oracle DB 연동 + 전체 백엔드 완성 [2026-05-20]

### 지시사항
- Oracle 23ai Free 로컬 연동
- 전체 엔티티/서비스/컨트롤러 구현
- 팀원 환경 구축 가이드 작성

### 완료 내용
- Oracle 23ai Free (freepdb1) + `dept_user` 계정 + `application-secret.properties` 분리
- 엔티티 10개: APP_USERS, NOTICES, POSTS, SCHEDULES, UNIVERSITIES, COLLEGE_SCHOOLS, FACULTY_GROUPS, DEPTS, PROFESSORS, CURRICULUM_ITEMS
- `DataInitializer (@Order 4)`: 목포대(6단과대·7학부·18학과) + 순천대(2단과대·2학부·4학과) + 각 교수 3명·교육과정 6개 자동 시드
- BCrypt 암호화 (`spring-security-crypto`)
- 공지/게시글 작성 API: dept/faculty/univ 스코프별 `POST /api/notices`, `/api/posts`
- `SpaController` 누락 경로 전수 등록
- `SignupPage.tsx` 버그 수정 (signupApi 실제 호출, phone/grade 필드 추가)
- `docs/DB_SETUP_GUIDE.md` 최초 작성

---

## Phase 5 — 선택 영속성 + 캘린더 리디자인 [2026-05-14~15]

### 지시사항
- 학교/학과 선택값 새로고침 후에도 유지 (localStorage)
- MainPage 캘린더 UI 개선

### 완료 내용
- `useInitialRedirect` 훅: localStorage에 선택값이 있으면 자동 이동
- `/dept/*` 라우트 가드: 미선택 시 학교 선택 페이지로 리다이렉트
- `MiniCalendar.tsx`: buildCalendarGrid, 이벤트 점(dot), 호버/클릭 팝오버
- MainPage 2-column 그리드 레이아웃 + MiniCalendar 통합

---

## Phase 4 — React SPA 마이그레이션 [2026-05-14]

### 지시사항
- Spring Boot + Thymeleaf → Vite + React + TypeScript SPA 전환

### 완료 내용
- `frontend/` Vite 프로젝트 초기화
- `DeptContext`: localStorage 기반 전역 학과 선택 상태 (`selectedDeptId`, `selectedUniversityId`)
- `SessionStorage`: memberType, name, username, grade (로그인 시 저장)
- Vite proxy 설정 (`/api` → `localhost:8080`)
- Spring Boot `SpaController`: `/**` → `index.html` fallback
- 빌드 시 `demo/demo/src/main/resources/static/` 자동 배포

---

## Phase 3 — 학교 선택 랜딩 페이지 [2026-05-13]

### 지시사항
- 접속 시 대학 목록 → 단과대 → 학과 3단계 선택 흐름

### 완료 내용
- `UniversityListPage`, `UniversityShowPage`, `SchoolDepartmentsPage`
- `SchoolController`: 세션 기반 학과 선택 저장
- `/` → 학교 선택, `/dept/home` → 학과 메인 라우팅 재구조화

---

## Phase 2 — 공지사항·게시판 설계 [2026-05-11]

### 지시사항
- 공지사항·게시판·일정·학과정보 페이지 구조 설계
- 필터탭, 페이지네이션, 사이드바 UI 설계

### 완료 내용
- Navbar, FilterTabs, FeaturedCard, Sidebar, Pagination 공통 컴포넌트
- TypeScript DTO 타입 정의 (NoticeDto, PostDto, ScheduleDto)
- API fetch 함수 (`api/universities.ts`)
- 공지사항·게시판·일정·학과정보·로그인 플레이스홀더 페이지
- B&W Tailwind CSS 전체 리디자인

---

## Phase 1 — 프로젝트 초기 설정 [2026-05-08]

### 지시사항
- 학과 정보통합 서비스 포털 뼈대 설계 및 구현

### 스택
- Backend: Spring Boot 4 + Java 17 + Spring Data JPA
- DB: Oracle 23ai Free (로컬, `freepdb1`)
- Frontend: React 19 + TypeScript 6 + Vite 8 + Tailwind CSS 3
- 인증: 자체 구현 (BCrypt, sessionStorage)
- VCS: Git (팀 협업)

### 프로젝트 목표
학과·학부·대학의 공지사항·게시판·일정·학과정보를 한 곳에서 확인할 수 있는 통합 포털.

### 규칙
- DB 접속 정보는 `application-secret.properties`에 분리, git 커밋 금지
- `application-secret.properties`는 반드시 `.gitignore`에 포함

---

## 현재 구현 상태 (2026-05-28 기준)

### 백엔드
- Spring Boot 4 / Java 17 / Spring Data JPA / Oracle 23ai Free
- 엔티티 20개, 자동 테이블 생성 (ddl-auto=update)
- RBAC: SUPER_ADMIN > SCHOOL_ADMIN > DEPT_ADMIN (adminRole 컬럼 기반)
- 역할 계층 검증: 상위→하위 강등 불가, admin 타입 최소 역할 보장

### 프론트엔드
- React 19 + TypeScript 6 + Vite 8 + Tailwind CSS 3 + React Router 7
- 실행: `cd frontend && npm run dev` → http://localhost:5173
- 빌드: `npm run build` → static/ 배포

### 관리자 대시보드 구조
| 역할 | 접근 URL | 주요 기능 |
|------|---------|----------|
| SUPER_ADMIN | `/admin/super` | 전체 학교 CRUD, 역할 부여, 통계 |
| SCHOOL_ADMIN | `/admin/school/:id` | 학교 사용자·게시글·공지·역할 관리 |
| DEPT_ADMIN | `/admin/dept/:id` | 학과 게시글·공지·사용자 관리 |
| (추가) | `/admin/faculty/:id` | 학부 관리 |

### Mock 계정 (자동 시딩)
- 교수 5명: `prof_kim`, `prof_lee`, `prof_park`, `prof_choi`, `prof_jung` / PW: `prof1234`
- 학생 3명: `stu_kim1`, `stu_lee2`, `stu_park1` / PW: `stu1234`
