# React SPA 마이그레이션 설계 문서

**날짜:** 2026-05-14  
**프로젝트:** 학과정보통합서비스  
**작업 범위:** Spring Boot + Thymeleaf → React SPA + Spring Boot REST API

---

## 1. 배경 및 목표

현재 프로젝트는 Spring Boot + Thymeleaf 서버사이드 렌더링 구조로, 각 HTML 페이지마다 Navbar가 중복되고 인터랙션은 인라인 JavaScript로 처리된다. 이를 React 기반 SPA로 전환하여 컴포넌트 재사용성, 상태 관리 명확성, 유지보수성을 높인다.

---

## 2. 기술 스택

| 항목 | 결정 사항 |
|---|---|
| 프론트엔드 도구 | Vite + React 18 + TypeScript |
| 스타일링 | Tailwind CSS (npm 설치, 기존 클래스 재사용) |
| 라우팅 | react-router-dom v6 |
| 상태 관리 | useState + useEffect + Context API |
| API 통신 | fetch + Vite proxy → Spring Boot :8080 |
| 인증 | 로그인 UI만 구현 (실제 인증 로직 제외) |

---

## 3. 아키텍처

### 프로젝트 구조

```
webprogramming_team-main/
├── demo/demo/          ← Spring Boot (REST API로 전환)
└── frontend/           ← 새 Vite + React + TypeScript 프로젝트
    ├── src/
    │   ├── api/        ← fetch 함수 모음
    │   ├── components/ ← 공통 컴포넌트
    │   ├── pages/      ← 페이지 컴포넌트
    │   ├── types/      ← DTO 타입 정의
    │   ├── context/    ← DeptContext (전역 학과 선택 상태)
    │   └── main.tsx
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.ts
```

### 데이터 흐름

```
React (frontend :5173)
    ↕  fetch("/api/...")
    ↕  Vite proxy (개발 환경 CORS 우회)
Spring Boot (backend :8080)
    ↕  @RestController → JSON 반환
```

---

## 4. 컴포넌트 구조

### 공통 컴포넌트 (`src/components/`)

| 컴포넌트 | 역할 | 기존 대응 |
|---|---|---|
| `Navbar` | 고정 상단 네비게이션, 모바일 햄버거 메뉴, 현재 페이지 활성 표시 | 각 HTML 파일에 반복된 `<nav>` |
| `FeaturedCard` | 이미지 플레이스홀더 + 제목 오버레이 배너 | 공지·게시판 상단 featured 섹션 |
| `FilterTabs` | 카테고리 필터 버튼 그룹 | 공지·게시판·일정 공통 JS 필터 |
| `Sidebar` | 카테고리 위젯 + 최근 목록 위젯 | 공지·게시판·일정 우측 사이드바 |
| `Pagination` | 페이지네이션 버튼 행 | 공지·게시판 더미 페이지네이션 |

### 페이지 컴포넌트 (`src/pages/`)

| 파일 | 라우트 | 대응 Thymeleaf 파일 |
|---|---|---|
| `UniversitySelectPage` | `/universities` | `university/index.html` |
| `SchoolListPage` | `/universities/:id` | `university/show.html` |
| `SchoolDetailPage` | `/schools/:id` | `school/show.html` |
| `MainPage` | `/` | `main/index.html` |
| `NoticePage` | `/notice` | `notice/list.html` |
| `BoardPage` | `/board` | `board/list.html` |
| `SchedulePage` | `/schedule` | `schedule/list.html` |
| `DepartmentPage` | `/department` | `department/index.html` |
| `LoginPage` | `/login` | `auth/login.html` |

### 라우팅 구조

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/universities" element={<UniversitySelectPage />} />
    <Route path="/universities/:id" element={<SchoolListPage />} />
    <Route path="/schools/:id" element={<SchoolDetailPage />} />
    <Route path="/" element={<MainPage />} />
    <Route path="/notice" element={<NoticePage />} />
    <Route path="/board" element={<BoardPage />} />
    <Route path="/schedule" element={<SchedulePage />} />
    <Route path="/department" element={<DepartmentPage />} />
    <Route path="/login" element={<LoginPage />} />
  </Routes>
</BrowserRouter>
```

---

## 5. 상태 관리

외부 라이브러리 없이 React 기본 Hooks만 사용한다.

| 상태 | 위치 | Hook |
|---|---|---|
| 선택된 학과 정보 (`selectedDeptName` 등) | `App.tsx` (전역) | `useState` + Context API |
| 각 페이지 데이터 (notices, posts 등) | 각 Page 컴포넌트 | `useState` + `useEffect` |
| 카테고리 필터 / 정렬 상태 | 각 Page 컴포넌트 | `useState` |
| 모바일 메뉴 열림/닫힘 | `Navbar` 컴포넌트 | `useState` |

Spring Boot의 세션 기반 학과 선택(`selectedDeptName`, `selectedUniversityId`)은 **Context API**로 대체한다.

```tsx
// src/context/DeptContext.tsx
interface DeptContextType {
  selectedDeptName: string | null;
  selectedUniversityId: number | null;
  selectedSchoolId: number | null;
  setDept: (dept: DeptContextType) => void;
}
```

---

## 6. API 레이어

### fetch 함수 (`src/api/`)

```ts
// 예시: src/api/notices.ts
export async function fetchNotices(): Promise<NoticeDto[]> {
  const res = await fetch('/api/notices');
  return res.json();
}
```

각 페이지에서 `useEffect`로 데이터 로딩:

```tsx
const [notices, setNotices] = useState<NoticeDto[]>([]);
useEffect(() => {
  fetchNotices().then(setNotices);
}, []);
```

### Vite 프록시 설정

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

---

## 7. Spring Boot REST 전환 범위

기존 `@Controller` → `@RestController`로 변경하고 JSON 반환. Thymeleaf 의존성은 유지해도 되나 신규 엔드포인트는 모두 REST로 추가한다.

| 기존 Controller | 추가할 REST 엔드포인트 |
|---|---|
| `MainController` | `GET /api/main` → `{notices, posts, schedules, today}` |
| `NoticeController` | `GET /api/notices` → `NoticeDto[]` |
| `BoardController` | `GET /api/posts` → `PostDto[]` |
| `ScheduleController` | `GET /api/schedules` → `ScheduleDto[]` |
| `UniversityController` | `GET /api/universities`, `GET /api/universities/{id}` |
| `SchoolController` | `GET /api/schools/{id}` |
| `DepartmentController` | REST 엔드포인트 불필요 — `DepartmentPage`는 정적 컴포넌트로 구현 (현재 페이지가 완전 정적 더미 데이터) |

---

## 8. 구현 순서

1. **프로젝트 초기화** — `frontend/` Vite 프로젝트 생성, Tailwind 설치, proxy 설정
2. **타입 정의** — `NoticeDto`, `PostDto`, `ScheduleDto`, `UniversityDto`, `SchoolDto` TypeScript 타입
3. **공통 컴포넌트** — `Navbar`, `FilterTabs`, `FeaturedCard`, `Sidebar`, `Pagination`
4. **Context 설정** — `DeptContext` 전역 학과 선택 상태
5. **Spring Boot REST 전환** — 기존 컨트롤러에 `/api/*` 엔드포인트 추가
6. **페이지 구현 (순서대로)**
   - `UniversitySelectPage` → `SchoolListPage` → `SchoolDetailPage`
   - `MainPage`
   - `NoticePage` → `BoardPage` → `SchedulePage`
   - `DepartmentPage` → `LoginPage`

---

## 9. 디자인 제약

- 모든 페이지의 **시각적 결과물은 기존 Thymeleaf 페이지와 동일**해야 한다.
- 기존 Tailwind CSS 클래스를 그대로 재사용한다.
- Font Awesome 아이콘은 `index.html`의 CDN `<link>` 태그로 유지한다. (npm 패키지 불필요, 기존 클래스명 그대로 사용)
- 흑백 미니멀 디자인 테마(`bg-black`, `text-white`, `border-black` 등)를 변경하지 않는다.
