# 학과정보통합서비스 — 프로젝트 가이드

> 이 문서를 읽으면 프로젝트의 전체 구성, 사용 기술, 동작 방식, 구현된 기능을 파악할 수 있습니다.

---

## 1. 프로젝트 개요

**프로젝트명:** 학과정보통합서비스 (dept-portal)

**목적:** 국립목포대학교 등 여러 대학교의 학과 공지사항, 게시판, 일정, 학과정보를 하나의 웹 포털로 통합하여 학생과 교직원이 편리하게 접근할 수 있도록 합니다.

**현재 단계:** 프론트엔드 UI 및 REST API 뼈대 완성. 모든 페이지 UI와 더미 데이터가 구현되어 있으며, 로그인·회원가입·아이디/비밀번호 찾기 기능도 인메모리 방식으로 구현되어 있습니다. 팀원이 실제 DB 연동 및 서비스 로직을 추가하면 됩니다.

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
| DB ORM | Spring Data JPA / Hibernate | DB 연동용 (현재 비활성화) |
| DB | Oracle AI Database | 실제 데이터 저장소 (현재 미연동) |
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
│       │   ├── SchoolBoardPage.tsx     ← /school/board
│       │   ├── SchoolSchedulePage.tsx  ← /school/schedule
│       │   ├── SchoolInfoPage.tsx      ← /school/info
│       │   ├── MainPage.tsx            ← /dept/home (학과 메인)
│       │   ├── NoticePage.tsx          ← /dept/notice
│       │   ├── BoardPage.tsx           ← /dept/board
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
│           ├── FeaturedCard.tsx
│           ├── FilterTabs.tsx
│           ├── Sidebar.tsx
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
│       │   │   │   ├── SpaController.java        ← SPA 라우트 → index.html 포워딩
│       │   │   │   ├── UniversityController.java ← GET /api/universities
│       │   │   │   ├── DepartmentController.java ← GET /api/departments/:id
│       │   │   │   ├── NoticeController.java     ← GET /api/notices
│       │   │   │   ├── BoardController.java      ← GET /api/posts
│       │   │   │   ├── ScheduleController.java   ← GET /api/schedules
│       │   │   │   ├── SchoolController.java     ← GET /api/school/*
│       │   │   │   └── AuthController.java       ← POST/GET /api/auth/* (인증)
│       │   │   ├── service/
│       │   │   │   └── AuthService.java          ← 인증 비즈니스 로직
│       │   │   ├── entity/
│       │   │   │   └── User.java                 ← 회원 엔티티 (JPA 어노테이션 주석 처리)
│       │   │   ├── repository/
│       │   │   │   ├── UserRepository.java       ← 회원 저장소 인터페이스
│       │   │   │   └── UserRepositoryImpl.java   ← 인메모리 구현체 (DB 연동 시 삭제)
│       │   │   ├── dto/                          ← API 요청/응답 데이터 구조
│       │   │   │   ├── (기존 DTO들...)
│       │   │   │   ├── LoginRequestDto.java
│       │   │   │   ├── SignupRequestDto.java
│       │   │   │   ├── FindIdRequestDto.java
│       │   │   │   └── FindPasswordRequestDto.java
│       │   │   └── util/
│       │   │       └── DummyDataHelper.java      ← 모든 더미 데이터 집중 관리
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
| `/school/board` | SchoolBoardPage | 대학 게시판 |
| `/school/schedule` | SchoolSchedulePage | 대학 일정 |
| `/school/info` | SchoolInfoPage | 대학 정보 |
| `/dept/home` | MainPage | 학과 메인 대시보드 |
| `/dept/notice` | NoticePage | 학과 공지사항 |
| `/dept/board` | BoardPage | 학과 게시판 |
| `/dept/board/write` | WritePostPage | 게시글 작성 |
| `/dept/schedule` | SchedulePage | 학과 일정 |
| `/dept/department` | DepartmentPage | 학과정보 |
| `/login` | LoginPage | 로그인 |
| `/signup` | SignupPage | 회원가입 |
| `/mypage` | MyPage | 마이페이지 |
| `/find-id` | FindIdPage | 아이디 찾기 |
| `/find-password` | FindPasswordPage | 비밀번호 찾기 |

**사용자 흐름 (순차 강제):**

```
/ (진입)
  → /universities        대학교 선택
  → /school/departments  학부·학과 선택
  → /dept/home           학과 메인 대시보드
  → /dept/*              학과 하위 페이지
```

**접근 보호 (`App.tsx`):**

| 가드 | 적용 라우트 | 조건 미충족 시 |
|------|------------|--------------|
| `ProtectedSchool` | `/school/*` | `selectedUniversityId` 없음 → `/universities` |
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
| POST | `/api/auth/login` | Body: `{username, password, memberType}` | 로그인 |
| POST | `/api/auth/signup` | Body: 회원 정보 | 회원가입 |
| GET | `/api/auth/check-id` | `username` | 아이디 중복 확인 |
| POST | `/api/auth/find-id` | Body: `{name, phone}` | 아이디 찾기 |
| POST | `/api/auth/find-password` | Body: `{username, name, phone}` | 비밀번호 찾기 (임시 비밀번호 반환) |

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
- **학과 상세:** `deptId`로 교수진(3명)·교육과정(6개)·연락정보를 생성

> DB 연동 시: 각 컨트롤러에서 `DummyDataHelper` 호출 부분을 Service 호출로 교체하면 됩니다.

---

## 10. Navbar 동작 방식

`Navbar.tsx`는 현재 URL 경로에 따라 자동으로 두 가지 모드로 전환됩니다.

| 모드 | 조건 | 표시 링크 |
|------|------|----------|
| 학교(School) 모드 | `/school/*` 또는 `/universities/:id` | 학과선택·공지사항·게시판·일정·학교정보 |
| 학과(Dept) 모드 | `/dept/*` | 공지사항·게시판·일정·학과정보 |

- 학교 모드: 로고 클릭 시 `/universities/:id` (대학 홈)로 이동, 대학명 배지 표시
- 학과 모드: 로고 클릭 시 `/dept/home` (학과 메인)으로 이동, 학과명 배지 표시

---

## 11. 인증(로그인·회원가입) 구현 현황

### 현재 구조

인증 기능이 `AuthController` → `AuthService` → `UserRepositoryImpl` 구조로 구현되어 있습니다.

- **회원 저장소:** `UserRepositoryImpl`은 인메모리(`ArrayList`) 방식으로 동작합니다. 서버 재시작 시 데이터가 초기화됩니다.
- **비밀번호:** 현재 평문 저장. DB 연동 시 BCrypt 암호화로 교체 예정 (`AuthService` 주석 참고).
- **세션/토큰:** 현재 미구현. 로그인 성공 시 응답 JSON만 반환하며, 클라이언트 상태 관리는 프론트엔드에서 직접 처리합니다.

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

### DB 연동 시 인증 전환 방법

1. `User.java`의 JPA 어노테이션 주석 해제 (`@Entity`, `@Id` 등)
2. `UserRepository`를 `JpaRepository<User, Long>` 상속으로 변경
3. `UserRepositoryImpl.java` 삭제 (JPA가 자동 구현)
4. `AuthService`의 BCrypt 주석 해제 및 평문 비교 코드 교체

---

## 12. DB 연동 방법 (팀원 작업 시)

1. `docs/DB_SETUP_GUIDE.md` 참고하여 `application-secret.properties` 생성
2. Oracle DB 접속 정보 입력 (팀 채널에서 공유)
3. `application.properties`에서 `spring.autoconfigure.exclude` 3줄 제거
4. 각 컨트롤러에서 `DummyDataHelper.*` 호출을 Service 호출로 교체
5. 앱 재시작

**주의:** `application-secret.properties`는 `.gitignore`에 등록되어 있어 Git에 절대 올라가지 않습니다.

---

## 13. 파일별 역할 한 줄 요약

| 파일 | 역할 |
|------|------|
| `App.tsx` | 전체 라우트 정의, ProtectedSchool/ProtectedDept 접근 보호 |
| `DeptContext.tsx` | 선택된 대학/학과 전역 상태, localStorage 동기화 |
| `useDeptFetch.ts` | fetcher 함수 + id를 받아 데이터 로딩 처리하는 범용 훅 |
| `useInitialRedirect.ts` | 앱 시작 리다이렉트 결정 훅. 로그인 연동 시 `[AUTH_HOOK]` 주석 위치에 주입 |
| `Navbar.tsx` | URL 기반 학교/학과 모드 자동 전환 네비게이션 바 |
| `UniversityListPage.tsx` | 대학교 카드 목록, 선택 시 학과 선택 페이지로 이동 |
| `UniversityShowPage.tsx` | 대학교 홈 (단과대 목록, 바로가기) |
| `SchoolDepartmentsPage.tsx` | 단과대·학부·학과 3단 계층 그리드, 학과 클릭 시 `/dept/home`으로 이동 |
| `DepartmentPage.tsx` | 학과 상세 (API에서 교수진·교육과정·연락정보 조회) |
| `WritePostPage.tsx` | 게시글 작성 폼 (`/dept/board/write`) |
| `LoginPage.tsx` | 로그인 폼, `auth.ts`의 `loginApi` 호출 |
| `SignupPage.tsx` | 회원가입 폼 (학생·교수·관리자 선택), `signupApi` 호출 |
| `MyPage.tsx` | 마이페이지 (로그인 사용자 정보 표시) |
| `FindIdPage.tsx` | 이름·전화번호로 아이디 찾기 |
| `FindPasswordPage.tsx` | 아이디·이름·전화번호로 임시 비밀번호 발급 |
| `auth.ts` | `/api/auth/*` 호출 함수 (login, signup, checkId, findId, findPassword) |
| `SpaController.java` | `/api/**` 외 모든 경로를 `index.html`로 포워딩 (SPA 새로고침 지원) |
| `AuthController.java` | `POST/GET /api/auth/*` — 로그인·회원가입·아이디/비밀번호 찾기 |
| `AuthService.java` | 인증 비즈니스 로직. DB 연동 시 BCrypt 주석 참고 |
| `User.java` | 회원 엔티티. DB 연동 시 JPA 어노테이션 주석 해제 |
| `UserRepository.java` | 회원 저장소 인터페이스 |
| `UserRepositoryImpl.java` | 인메모리 구현체. DB 연동 시 이 파일 삭제 |
| `DummyDataHelper.java` | 모든 더미 데이터 집중 관리 (DB 연동 전 임시) |
| `UniversityController.java` | `GET /api/universities[/:id]` 응답 |
| `DepartmentController.java` | `GET /api/departments/:id` 응답 |
| `SchoolController.java` | `GET /api/school/*` 응답 |
| `application.properties` | 포트(8080), DB 자동설정 비활성화 |
| `vite.config.ts` | 빌드 출력 경로(`static/`), `/api` 프록시 설정 |
