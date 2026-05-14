# React SPA 마이그레이션 구현 계획서

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spring Boot + Thymeleaf 프로젝트를 Vite + React + TypeScript SPA로 전환하고, Spring Boot는 JSON REST API 서버로 전환한다.

**Architecture:** `frontend/` 디렉토리에 Vite React TS 프로젝트를 생성한다. 전역 학과 선택 상태(selectedDeptName 등)는 Context API + localStorage로 관리한다. Spring Boot 기존 컨트롤러에 `/api/*` REST 엔드포인트를 추가한다. Vite proxy로 개발 환경 CORS를 우회한다.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS 3, react-router-dom 6, Vitest, @testing-library/react, Spring Boot 3 (Java 17)

---

## 파일 맵

### 신규 생성 (frontend/)

```
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── test-setup.ts
    ├── types/
    │   ├── notice.ts          — NoticeDto 타입
    │   ├── post.ts            — PostDto 타입
    │   ├── schedule.ts        — ScheduleDto 타입
    │   └── university.ts      — UniversityDto, SchoolDto, FacultyDto, DeptSelectionDto
    ├── context/
    │   └── DeptContext.tsx    — 전역 학과 선택 상태
    ├── api/
    │   ├── notices.ts       — fetchNotices()
    │   ├── posts.ts         — fetchPosts()
    │   ├── schedules.ts     — fetchSchedules()
    │   └── universities.ts  — fetchUniversities(), fetchUniversity(id), fetchMainData()
    ├── components/
    │   ├── Navbar.tsx
    │   ├── FilterTabs.tsx
    │   ├── FeaturedCard.tsx
    │   ├── Sidebar.tsx
    │   └── Pagination.tsx
    └── pages/
        ├── UniversityListPage.tsx
        ├── UniversityShowPage.tsx
        ├── SchoolSelectPage.tsx
        ├── MainPage.tsx
        ├── NoticePage.tsx
        ├── BoardPage.tsx
        ├── SchedulePage.tsx
        ├── DepartmentPage.tsx
        └── LoginPage.tsx
```

### 수정 (Spring Boot)

```
demo/demo/src/main/java/com/example/demo/controller/
├── MainController.java        — GET /api/main 추가
├── NoticeController.java      — GET /api/notices 추가
├── BoardController.java       — GET /api/posts 추가
├── ScheduleController.java    — GET /api/schedules 추가
└── UniversityController.java  — GET /api/universities, /api/universities/{id} 추가
```

---

## Task 1: 프론트엔드 프로젝트 초기화

**Files:**
- Create: `frontend/` (프로젝트 전체)

- [ ] **Step 1: Vite 프로젝트 생성 및 의존성 설치**

프로젝트 루트(`webprogramming_team-main/`)에서 실행:

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: `frontend/tailwind.config.js` 수정**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 3: `frontend/src/index.css` 전체 교체**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
}
```

- [ ] **Step 4: `frontend/vite.config.ts` 전체 교체**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

- [ ] **Step 5: `frontend/src/test-setup.ts` 생성**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: `frontend/index.html` 전체 교체**

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>학과정보통합서비스</title>
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: 빌드 확인**

```bash
cd frontend && npm run build
```

Expected: `dist/` 생성, 에러 없음

- [ ] **Step 8: 커밋**

```bash
cd .. && git add frontend/ && git commit -m "feat: initialize Vite React TS frontend project"
```

---

## Task 2: TypeScript 타입 정의

**Files:**
- Create: `frontend/src/types/notice.ts`
- Create: `frontend/src/types/post.ts`
- Create: `frontend/src/types/schedule.ts`
- Create: `frontend/src/types/university.ts`

- [ ] **Step 1: `frontend/src/types/notice.ts` 생성**

```ts
export interface NoticeDto {
  id: number
  title: string
  date: string
  author: string
  category: string
  viewCount: number
  featured: boolean
}
```

- [ ] **Step 2: `frontend/src/types/post.ts` 생성**

```ts
export interface PostDto {
  id: number
  title: string
  author: string
  likes: number
  category: string
  viewCount: number
  date: string
  featured: boolean
  commentCount: number
}
```

- [ ] **Step 3: `frontend/src/types/schedule.ts` 생성**

```ts
export interface ScheduleDto {
  id: number
  title: string
  date: string
  dday: number
  category: string
}
```

- [ ] **Step 4: `frontend/src/types/university.ts` 생성**

```ts
export interface DeptSelectionDto {
  id: number
  name: string
  facultyId: number
}

export interface FacultyDto {
  id: number
  name: string
  schoolId: number
  depts: DeptSelectionDto[]
}

export interface SchoolDto {
  id: number
  name: string
  description: string
  faculties: FacultyDto[]
}

export interface UniversityDto {
  id: number
  name: string
  description: string
  schools: SchoolDto[]
  totalDeptCount: number
}
```

- [ ] **Step 5: TypeScript 타입 체크**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 6: 커밋**

```bash
cd .. && git add frontend/src/types/ && git commit -m "feat: add TypeScript DTO types"
```

---

## Task 3: DeptContext (전역 학과 선택 상태)

**Files:**
- Create: `frontend/src/context/DeptContext.tsx`

Spring Boot 세션의 `selectedDeptName`, `selectedDeptId`, `selectedUniversityId`, `selectedUniversityName`, `selectedSchoolName`을 Context + localStorage로 대체한다.

- [ ] **Step 1: `frontend/src/context/DeptContext.tsx` 생성**

```tsx
import { createContext, useContext, useState, ReactNode } from 'react'

interface DeptState {
  selectedDeptId: number | null
  selectedDeptName: string | null
  selectedUniversityId: number | null
  selectedUniversityName: string | null
  selectedSchoolName: string | null
}

interface DeptContextType extends DeptState {
  setDept: (state: DeptState) => void
  clearDept: () => void
}

const STORAGE_KEY = 'deptState'

function loadFromStorage(): DeptState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : emptyState()
  } catch {
    return emptyState()
  }
}

function emptyState(): DeptState {
  return {
    selectedDeptId: null,
    selectedDeptName: null,
    selectedUniversityId: null,
    selectedUniversityName: null,
    selectedSchoolName: null,
  }
}

const DeptContext = createContext<DeptContextType | null>(null)

export function DeptProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DeptState>(loadFromStorage)

  const setDept = (next: DeptState) => {
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const clearDept = () => {
    setState(emptyState())
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <DeptContext.Provider value={{ ...state, setDept, clearDept }}>
      {children}
    </DeptContext.Provider>
  )
}

export function useDept(): DeptContextType {
  const ctx = useContext(DeptContext)
  if (!ctx) throw new Error('useDept must be used inside DeptProvider')
  return ctx
}
```

- [ ] **Step 2: TypeScript 체크**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
cd .. && git add frontend/src/context/ && git commit -m "feat: add DeptContext for global dept selection state"
```

---

## Task 4: API 레이어

**Files:**
- Create: `frontend/src/api/notices.ts`
- Create: `frontend/src/api/posts.ts`
- Create: `frontend/src/api/schedules.ts`
- Create: `frontend/src/api/universities.ts`

- [ ] **Step 1: `frontend/src/api/notices.ts` 생성**

```ts
import { NoticeDto } from '../types/notice'

export async function fetchNotices(): Promise<{ featured: NoticeDto; notices: NoticeDto[] }> {
  const res = await fetch('/api/notices')
  if (!res.ok) throw new Error('공지사항 로딩 실패')
  return res.json()
}
```

- [ ] **Step 2: `frontend/src/api/posts.ts` 생성**

```ts
import { PostDto } from '../types/post'

export async function fetchPosts(): Promise<{ featured: PostDto; posts: PostDto[] }> {
  const res = await fetch('/api/posts')
  if (!res.ok) throw new Error('게시글 로딩 실패')
  return res.json()
}
```

- [ ] **Step 3: `frontend/src/api/schedules.ts` 생성**

```ts
import { ScheduleDto } from '../types/schedule'

export async function fetchSchedules(): Promise<ScheduleDto[]> {
  const res = await fetch('/api/schedules')
  if (!res.ok) throw new Error('일정 로딩 실패')
  return res.json()
}
```

- [ ] **Step 4: `frontend/src/api/universities.ts` 생성**

```ts
import { UniversityDto } from '../types/university'

export async function fetchUniversities(): Promise<UniversityDto[]> {
  const res = await fetch('/api/universities')
  if (!res.ok) throw new Error('대학교 목록 로딩 실패')
  return res.json()
}

export async function fetchUniversity(id: number): Promise<UniversityDto> {
  const res = await fetch(`/api/universities/${id}`)
  if (!res.ok) throw new Error('대학교 로딩 실패')
  return res.json()
}

export async function fetchMainData(deptName: string): Promise<{
  notices: import('../types/notice').NoticeDto[]
  posts: import('../types/post').PostDto[]
  schedules: import('../types/schedule').ScheduleDto[]
  today: string
}> {
  const res = await fetch(`/api/main?deptName=${encodeURIComponent(deptName)}`)
  if (!res.ok) throw new Error('메인 데이터 로딩 실패')
  return res.json()
}
```

- [ ] **Step 5: TypeScript 체크**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 6: 커밋**

```bash
cd .. && git add frontend/src/api/ && git commit -m "feat: add API fetch functions"
```

---

## Task 5: Navbar 컴포넌트

**Files:**
- Create: `frontend/src/components/Navbar.tsx`

- [ ] **Step 1: 테스트 작성 — `frontend/src/components/Navbar.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

function renderNavbar(currentPath = '/') {
  return render(
    <MemoryRouter initialEntries={[currentPath]}>
      <Navbar />
    </MemoryRouter>
  )
}

test('로고가 렌더링된다', () => {
  renderNavbar()
  expect(screen.getByText('학과정보통합서비스')).toBeInTheDocument()
})

test('공지사항 링크가 존재한다', () => {
  renderNavbar()
  expect(screen.getAllByText('공지사항').length).toBeGreaterThan(0)
})

test('/notice 경로에서 공지사항 링크가 활성화된다', () => {
  renderNavbar('/notice')
  const links = screen.getAllByText('공지사항')
  const activeLink = links.find(el => el.closest('a')?.className.includes('border-white'))
  expect(activeLink).toBeTruthy()
})

test('햄버거 버튼 클릭 시 모바일 메뉴가 토글된다', () => {
  renderNavbar()
  const menuBefore = document.getElementById('mobileMenu')
  expect(menuBefore).toBeNull() // React에서는 state로 관리

  const button = screen.getByRole('button')
  fireEvent.click(button)
  expect(screen.getByTestId('mobile-menu')).toBeVisible()
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd frontend && npx vitest run src/components/Navbar.test.tsx
```

Expected: FAIL (Navbar not found)

- [ ] **Step 3: `frontend/src/components/Navbar.tsx` 구현**

```tsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/notice', label: '공지사항' },
  { to: '/board', label: '게시판' },
  { to: '/schedule', label: '일정' },
  { to: '/department', label: '학과정보' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
          학과정보통합서비스
        </Link>

        {/* 데스크탑 메뉴 */}
        <ul className="hidden md:flex gap-8 text-sm font-medium">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`pb-1 hover:opacity-70 transition border-b-2 ${
                  pathname === to ? 'border-white' : 'border-transparent'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* 로그인 버튼 */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition"
          >
            로그인
          </Link>
        </div>

        {/* 햄버거 버튼 */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="md:hidden text-white focus:outline-none"
          aria-label="메뉴 열기"
        >
          <i className="fas fa-bars text-xl" />
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <div
          data-testid="mobile-menu"
          className="md:hidden bg-black border-t border-gray-700 px-4 py-4 flex flex-col gap-4 text-sm"
        >
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`hover:opacity-70 ${pathname === to ? 'border-b border-white pb-1 font-medium' : ''}`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="mt-2 border border-white text-center py-1 rounded hover:bg-white hover:text-black transition"
          >
            로그인
          </Link>
        </div>
      )}
    </nav>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/components/Navbar.test.tsx
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
cd .. && git add frontend/src/components/Navbar.tsx frontend/src/components/Navbar.test.tsx
git commit -m "feat: add Navbar component with active link and mobile menu"
```

---

## Task 6: FilterTabs 컴포넌트

**Files:**
- Create: `frontend/src/components/FilterTabs.tsx`

- [ ] **Step 1: 테스트 작성 — `frontend/src/components/FilterTabs.test.tsx`**

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import FilterTabs from './FilterTabs'

test('탭 목록이 렌더링된다', () => {
  render(
    <FilterTabs
      tabs={['전체', '학사', '장학']}
      active="전체"
      onChange={() => {}}
    />
  )
  expect(screen.getByText('전체')).toBeInTheDocument()
  expect(screen.getByText('학사')).toBeInTheDocument()
  expect(screen.getByText('장학')).toBeInTheDocument()
})

test('활성 탭은 검정 배경을 갖는다', () => {
  render(
    <FilterTabs
      tabs={['전체', '학사']}
      active="학사"
      onChange={() => {}}
    />
  )
  const activeBtn = screen.getByText('학사')
  expect(activeBtn.className).toContain('bg-black')
})

test('탭 클릭 시 onChange가 호출된다', () => {
  const onChange = vi.fn()
  render(
    <FilterTabs
      tabs={['전체', '학사']}
      active="전체"
      onChange={onChange}
    />
  )
  fireEvent.click(screen.getByText('학사'))
  expect(onChange).toHaveBeenCalledWith('학사')
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd frontend && npx vitest run src/components/FilterTabs.test.tsx
```

Expected: FAIL

- [ ] **Step 3: `frontend/src/components/FilterTabs.tsx` 구현**

```tsx
interface FilterTabsProps {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}

export default function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 text-sm border border-black font-medium transition ${
            active === tab ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/components/FilterTabs.test.tsx
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
cd .. && git add frontend/src/components/FilterTabs.tsx frontend/src/components/FilterTabs.test.tsx
git commit -m "feat: add FilterTabs component"
```

---

## Task 7: FeaturedCard 컴포넌트

**Files:**
- Create: `frontend/src/components/FeaturedCard.tsx`

- [ ] **Step 1: `frontend/src/components/FeaturedCard.tsx` 생성**

(이 컴포넌트는 공지·게시판 페이지 상단 배너. UI only 컴포넌트이므로 테스트는 렌더링 확인으로 충분)

```tsx
interface FeaturedCardProps {
  category: string
  title: string
  date: string
  meta: string   // 조회수 또는 좋아요 수 문자열 (예: "👁 102" 또는 "❤ 45")
}

export default function FeaturedCard({ category, title, date, meta }: FeaturedCardProps) {
  return (
    <section className="mb-8">
      <div className="relative border-2 border-black overflow-hidden">
        {/* 이미지 플레이스홀더 */}
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <i className="fas fa-image text-5xl text-gray-400" />
        </div>
        {/* 오버레이 */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-5">
          <span className="inline-block bg-white text-black text-xs font-bold px-2 py-0.5 mb-2">
            {category}
          </span>
          <h2 className="text-white text-xl font-bold leading-tight">{title}</h2>
          <p className="text-gray-300 text-sm mt-1">
            {date}&nbsp;·&nbsp;{meta}
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
cd .. && git add frontend/src/components/FeaturedCard.tsx
git commit -m "feat: add FeaturedCard component"
```

---

## Task 8: Sidebar 컴포넌트

**Files:**
- Create: `frontend/src/components/Sidebar.tsx`

- [ ] **Step 1: 테스트 작성 — `frontend/src/components/Sidebar.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import Sidebar from './Sidebar'

test('위젯 제목이 렌더링된다', () => {
  render(
    <Sidebar
      categoryWidget={{
        title: '카테고리',
        items: [{ label: '전체', count: 32 }, { label: '학사', count: 14 }],
        onSelect: () => {},
      }}
      recentWidget={{
        title: '최근 공지',
        items: [{ title: '공지 제목', sub: '2026-05-11' }],
      }}
    />
  )
  expect(screen.getByText('카테고리')).toBeInTheDocument()
  expect(screen.getByText('최근 공지')).toBeInTheDocument()
  expect(screen.getByText('전체')).toBeInTheDocument()
  expect(screen.getByText('32')).toBeInTheDocument()
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd frontend && npx vitest run src/components/Sidebar.test.tsx
```

Expected: FAIL

- [ ] **Step 3: `frontend/src/components/Sidebar.tsx` 구현**

```tsx
interface CategoryItem {
  label: string
  count: number
}

interface RecentItem {
  title: string
  sub: string
}

interface SidebarProps {
  categoryWidget: {
    title: string
    items: CategoryItem[]
    onSelect: (label: string) => void
  }
  recentWidget: {
    title: string
    items: RecentItem[]
  }
}

export default function Sidebar({ categoryWidget, recentWidget }: SidebarProps) {
  return (
    <aside className="lg:w-72 flex-shrink-0 flex flex-col gap-6">
      {/* 카테고리 위젯 */}
      <div className="border-2 border-black">
        <div className="bg-black text-white px-4 py-2 text-sm font-bold">
          {categoryWidget.title}
        </div>
        <ul className="divide-y divide-gray-200 text-sm">
          {categoryWidget.items.map(({ label, count }) => (
            <li
              key={label}
              className="flex justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => categoryWidget.onSelect(label)}
            >
              <span>{label}</span>
              <span className="font-medium">{count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 최근 목록 위젯 */}
      <div className="border-2 border-black">
        <div className="bg-black text-white px-4 py-2 text-sm font-bold">
          {recentWidget.title}
        </div>
        <ul className="divide-y divide-gray-200 text-sm">
          {recentWidget.items.map((item, i) => (
            <li key={i} className="px-4 py-2 hover:bg-gray-50">
              <p className="leading-snug text-black">{item.title}</p>
              <span className="text-gray-400 text-xs">{item.sub}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/components/Sidebar.test.tsx
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
cd .. && git add frontend/src/components/Sidebar.tsx frontend/src/components/Sidebar.test.tsx
git commit -m "feat: add Sidebar component"
```

---

## Task 9: Pagination 컴포넌트

**Files:**
- Create: `frontend/src/components/Pagination.tsx`

- [ ] **Step 1: `frontend/src/components/Pagination.tsx` 생성**

```tsx
interface PaginationProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ current, total, onChange }: PaginationProps) {
  const pages = Array.from({ length: Math.min(total, 10) }, (_, i) => i + 1)

  return (
    <div className="flex justify-center gap-1 mt-8">
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 border border-black text-sm font-medium ${
            p === current ? 'bg-black text-white' : 'hover:bg-gray-100'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
cd .. && git add frontend/src/components/Pagination.tsx
git commit -m "feat: add Pagination component"
```

---

## Task 10: App.tsx 라우팅

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: `frontend/src/main.tsx` 수정**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2: `frontend/src/App.tsx` 전체 교체**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DeptProvider, useDept } from './context/DeptContext'
import UniversityListPage from './pages/UniversityListPage'
import UniversityShowPage from './pages/UniversityShowPage'
import SchoolSelectPage from './pages/SchoolSelectPage'
import MainPage from './pages/MainPage'
import NoticePage from './pages/NoticePage'
import BoardPage from './pages/BoardPage'
import SchedulePage from './pages/SchedulePage'
import DepartmentPage from './pages/DepartmentPage'
import LoginPage from './pages/LoginPage'

function ProtectedMain() {
  const { selectedDeptName } = useDept()
  if (!selectedDeptName) return <Navigate to="/universities" replace />
  return <MainPage />
}

export default function App() {
  return (
    <DeptProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/universities" element={<UniversityListPage />} />
          <Route path="/universities/:id" element={<UniversityShowPage />} />
          <Route path="/universities/:universityId/schools" element={<SchoolSelectPage />} />
          <Route path="/" element={<ProtectedMain />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/department" element={<DepartmentPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </DeptProvider>
  )
}
```

- [ ] **Step 3: 페이지 플레이스홀더 생성 (빌드 확인용)**

아직 없는 페이지 파일을 임시로 생성한다:

```bash
cd frontend/src/pages
for page in UniversityListPage UniversityShowPage SchoolSelectPage MainPage NoticePage BoardPage SchedulePage DepartmentPage LoginPage; do
  echo "export default function ${page}() { return <div>${page}</div> }" > ${page}.tsx
done
```

Windows PowerShell 환경이라면:

```powershell
$pages = @('UniversityListPage','UniversityShowPage','SchoolSelectPage','MainPage','NoticePage','BoardPage','SchedulePage','DepartmentPage','LoginPage')
foreach ($p in $pages) {
  Set-Content "frontend/src/pages/$p.tsx" "export default function $p() { return <div>$p</div> }"
}
```

- [ ] **Step 4: 빌드 확인**

```bash
cd frontend && npm run build
```

Expected: 에러 없음

- [ ] **Step 5: 커밋**

```bash
cd .. && git add frontend/src/App.tsx frontend/src/main.tsx frontend/src/pages/
git commit -m "feat: add React Router routing in App.tsx"
```

---

## Task 11: Spring Boot REST 엔드포인트 추가

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/controller/MainController.java`
- Modify: `demo/demo/src/main/java/com/example/demo/controller/NoticeController.java`
- Modify: `demo/demo/src/main/java/com/example/demo/controller/BoardController.java`
- Modify: `demo/demo/src/main/java/com/example/demo/controller/ScheduleController.java`
- Modify: `demo/demo/src/main/java/com/example/demo/controller/UniversityController.java`

- [ ] **Step 1: `MainController.java`에 `/api/main` 엔드포인트 추가**

기존 `index()` 메서드 아래에 추가:

```java
@GetMapping("/api/main")
@ResponseBody
public Map<String, Object> apiMain(@RequestParam(required = false, defaultValue = "") String deptName) {
    Map<String, Object> result = new HashMap<>();
    result.put("notices", List.of(
        new NoticeDto(1L, "2026년 1학기 수강신청 일정 안내", "2026-05-08", "학과사무실", "학사",  102, false),
        new NoticeDto(2L, "졸업논문 제출 마감 안내",         "2026-05-06", "학과사무실", "학사",   87, false),
        new NoticeDto(3L, "장학금 신청 안내 (5월 15일까지)", "2026-05-04", "학생처",     "장학",   65, false),
        new NoticeDto(4L, "실험실 안전교육 일정 공지",       "2026-05-02", "학과사무실", "학사",   43, false),
        new NoticeDto(5L, "2026 산학협력 세미나 개최 안내",  "2026-04-30", "학과사무실", "행사",   31, false)
    ));
    result.put("posts", List.of(
        new PostDto(1L, "중간고사 자료구조 족보 공유합니다",    "박민수", 45, "자유게시판", 312, "2026-05-01", false, 18),
        new PostDto(2L, "카카오 인턴십 합격 후기 (2026 상반기)", "이철수", 32, "취업후기",  280, "2026-04-28", false, 25),
        new PostDto(3L, "알고리즘 스터디 같이 할 분 모집",      "홍길동", 24, "스터디",    150, "2026-04-25", false,  7),
        new PostDto(4L, "졸업작품 팀원 구합니다 (4인 팀)",      "김영희", 18, "자유게시판",  98, "2026-04-20", false, 33),
        new PostDto(5L, "교수님 연구실 학부 인턴 모집 공고",    "정교수", 12, "취업후기",   74, "2026-04-18", false,  3)
    ));
    result.put("schedules", List.of(
        new ScheduleDto(1L, "중간고사 시작",   "2026-05-12",  1, "시험"),
        new ScheduleDto(2L, "프로젝트 발표",   "2026-05-20",  9, "학사"),
        new ScheduleDto(3L, "학과 축제",       "2026-06-01", 21, "행사"),
        new ScheduleDto(4L, "기말고사 시작",   "2026-06-16", 36, "시험"),
        new ScheduleDto(5L, "여름 방학 시작",  "2026-06-27", 47, "학사")
    ));
    result.put("today", LocalDate.now()
        .format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 EEEE", Locale.KOREAN)));
    result.put("selectedDeptName", deptName);
    return result;
}
```

파일 상단 import 추가:
```java
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import java.util.HashMap;
import java.util.Map;
```

- [ ] **Step 2: `NoticeController.java`에 `/api/notices` 추가**

기존 컨트롤러에 다음 메서드 추가:

```java
@GetMapping("/api/notices")
@ResponseBody
public Map<String, Object> apiNotices() {
    NoticeDto featured = new NoticeDto(1L, "[긴급] 2026년 1학기 수강정정 기간 안내", "2026-05-11", "학과사무실", "학사", 215, true);
    List<NoticeDto> notices = List.of(
        new NoticeDto(1L, "[긴급] 2026년 1학기 수강정정 기간 안내", "2026-05-11", "학과사무실", "학사", 215, true),
        new NoticeDto(2L, "2026년 1학기 수강신청 일정 안내",         "2026-05-08", "학과사무실", "학사", 102, false),
        new NoticeDto(3L, "졸업논문 제출 마감 안내",                 "2026-05-06", "학과사무실", "학사",  87, false),
        new NoticeDto(4L, "장학금 신청 안내 (5월 15일까지)",         "2026-05-04", "학생처",     "장학",  65, false),
        new NoticeDto(5L, "실험실 안전교육 일정 공지",               "2026-05-02", "학과사무실", "학사",  43, false),
        new NoticeDto(6L, "2026 산학협력 세미나 개최 안내",          "2026-04-30", "학과사무실", "행사",  31, false),
        new NoticeDto(7L, "졸업작품 심사 일정 공지",                 "2026-04-28", "학과사무실", "학사",  28, false),
        new NoticeDto(8L, "교내 해커톤 참가 모집",                   "2026-04-25", "학생처",     "행사",  19, false)
    );
    return Map.of("featured", featured, "notices", notices);
}
```

import 추가:
```java
import org.springframework.web.bind.annotation.ResponseBody;
import java.util.Map;
import java.util.List;
```

- [ ] **Step 3: `BoardController.java`에 `/api/posts` 추가**

```java
@GetMapping("/api/posts")
@ResponseBody
public Map<String, Object> apiPosts() {
    PostDto featured = new PostDto(1L, "중간고사 자료구조 족보 공유합니다", "박민수", 45, "자유게시판", 312, "2026-05-01", true, 18);
    List<PostDto> posts = List.of(
        new PostDto(1L, "중간고사 자료구조 족보 공유합니다",    "박민수", 45, "자유게시판", 312, "2026-05-01", true,  18),
        new PostDto(2L, "카카오 인턴십 합격 후기 (2026 상반기)", "이철수", 32, "취업후기",  280, "2026-04-28", false, 25),
        new PostDto(3L, "알고리즘 스터디 같이 할 분 모집",      "홍길동", 24, "스터디",    150, "2026-04-25", false,  7),
        new PostDto(4L, "졸업작품 팀원 구합니다 (4인 팀)",      "김영희", 18, "자유게시판",  98, "2026-04-20", false, 33),
        new PostDto(5L, "교수님 연구실 학부 인턴 모집 공고",    "정교수", 12, "취업후기",   74, "2026-04-18", false,  3),
        new PostDto(6L, "운영체제 과제 질문있어요",             "학생A",   8, "질문",       45, "2026-04-15", false,  6),
        new PostDto(7L, "데이터베이스 스터디원 모집",           "학생B",   6, "스터디",     32, "2026-04-12", false,  4),
        new PostDto(8L, "취업 준비 팁 공유",                   "학생C",   5, "취업후기",   28, "2026-04-10", false,  9),
        new PostDto(9L, "1학년 수강신청 추천 조합",            "학생D",   3, "자유게시판",  18, "2026-04-08", false,  2)
    );
    return Map.of("featured", featured, "posts", posts);
}
```

import 추가:
```java
import org.springframework.web.bind.annotation.ResponseBody;
import java.util.Map;
import java.util.List;
```

- [ ] **Step 4: `ScheduleController.java`에 `/api/schedules` 추가**

```java
@GetMapping("/api/schedules")
@ResponseBody
public List<ScheduleDto> apiSchedules() {
    return List.of(
        new ScheduleDto(1L, "중간고사 시작",      "2026-05-12",  1, "시험"),
        new ScheduleDto(2L, "프로젝트 발표",      "2026-05-20",  9, "학사"),
        new ScheduleDto(3L, "수강신청 변경기간",   "2026-05-25", 14, "학사"),
        new ScheduleDto(4L, "학과 축제",          "2026-06-01", 21, "행사"),
        new ScheduleDto(5L, "기말고사 시작",      "2026-06-16", 36, "시험"),
        new ScheduleDto(6L, "기말고사 종료",      "2026-06-20", 40, "시험"),
        new ScheduleDto(7L, "여름 방학 시작",     "2026-06-27", 47, "학사"),
        new ScheduleDto(8L, "졸업논문 제출 마감", "2026-07-15", 65, "학사")
    );
}
```

import 추가:
```java
import org.springframework.web.bind.annotation.ResponseBody;
import java.util.List;
```

- [ ] **Step 5: `UniversityController.java`에 REST 엔드포인트 추가**

기존 컨트롤러에 추가:

```java
@GetMapping("/api/universities")
@ResponseBody
public List<UniversityDto> apiUniversities() {
    return DummyDataHelper.getUniversities();
}

@GetMapping("/api/universities/{id}")
@ResponseBody
public ResponseEntity<UniversityDto> apiUniversity(@PathVariable Long id) {
    UniversityDto university = DummyDataHelper.findUniversity(id);
    if (university == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(university);
}
```

import 추가:
```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ResponseBody;
import java.util.List;
```

- [ ] **Step 6: Spring Boot 빌드 확인**

```bash
cd demo/demo && ./mvnw compile
```

Expected: BUILD SUCCESS

- [ ] **Step 7: API 동작 확인 (Spring Boot 실행 후)**

```bash
# 터미널 1: Spring Boot 실행
cd demo/demo && ./mvnw spring-boot:run

# 터미널 2: API 확인
curl http://localhost:8080/api/universities
curl http://localhost:8080/api/notices
curl http://localhost:8080/api/posts
curl http://localhost:8080/api/schedules
```

Expected: 각 curl 명령에서 JSON 응답

- [ ] **Step 8: 커밋**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/
git commit -m "feat: add REST API endpoints to Spring Boot controllers"
```

---

## Task 12: UniversityListPage

**Files:**
- Modify: `frontend/src/pages/UniversityListPage.tsx`

- [ ] **Step 1: `frontend/src/pages/UniversityListPage.tsx` 구현**

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UniversityDto } from '../types/university'
import { fetchUniversities } from '../api/universities'

export default function UniversityListPage() {
  const [universities, setUniversities] = useState<UniversityDto[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchUniversities().then(setUniversities)
  }, [])

  return (
    <div className="bg-white text-black font-sans">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/universities" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
            학과정보통합서비스
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition">
              로그인
            </Link>
          </div>
          <button onClick={() => setMenuOpen(p => !p)} className="md:hidden text-white focus:outline-none">
            <i className="fas fa-bars text-xl" />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-black border-t border-gray-700 px-4 py-4 flex flex-col gap-4 text-sm">
            <Link to="/login" className="mt-2 border border-white text-center py-1 rounded hover:bg-white hover:text-black transition">
              로그인
            </Link>
          </div>
        )}
      </nav>

      <div className="pt-14" />

      {/* 히어로 */}
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <i className="fas fa-university mr-3" />대학교 선택
          </h1>
          <p className="text-gray-400 text-sm md:text-base">소속 대학교를 선택하세요</p>
        </div>
      </section>

      {/* 대학교 카드 */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {universities.map(univ => (
            <Link
              key={univ.id}
              to={`/universities/${univ.id}`}
              className="group block border-2 border-black p-8 hover:bg-black hover:text-white transition cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <i className="fas fa-university text-3xl mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold mb-2">{univ.name}</h2>
                  <p className="text-sm text-gray-500 group-hover:text-gray-300 leading-snug">
                    {univ.description}
                  </p>
                  <div className="mt-4 flex gap-4 text-xs text-gray-400">
                    <span><i className="fas fa-building mr-1" />{univ.schools.length}개 단과대학</span>
                    <span><i className="fas fa-door-open mr-1" />{univ.totalDeptCount}개 학과</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-gray-200 group-hover:border-gray-600 flex items-center justify-between text-sm font-medium">
                <span>대학교 입장</span>
                <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
cd .. && git add frontend/src/pages/UniversityListPage.tsx
git commit -m "feat: implement UniversityListPage"
```

---

## Task 13: UniversityShowPage

**Files:**
- Modify: `frontend/src/pages/UniversityShowPage.tsx`

- [ ] **Step 1: `frontend/src/pages/UniversityShowPage.tsx` 구현**

```tsx
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { UniversityDto } from '../types/university'
import { fetchUniversity } from '../api/universities'

export default function UniversityShowPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [univ, setUniv] = useState<UniversityDto | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  useEffect(() => {
    if (!id) return
    fetchUniversity(Number(id)).then(setUniv).catch(() => navigate('/universities'))
  }, [id, navigate])

  if (!univ) return null

  return (
    <div className="bg-white text-black font-sans">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/universities" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
            학과정보통합서비스
          </Link>
          <ul className="hidden md:flex gap-8 text-sm font-medium">
            <li>
              <Link to={`/universities/${univ.id}/schools`} className="pb-1 hover:opacity-70 transition border-b-2 border-white text-white">
                <i className="fas fa-list-ul mr-1 text-xs" />학부·학과 선택
              </Link>
            </li>
            <li><Link to="/notice"   className="pb-1 hover:opacity-70 transition border-b-2 border-transparent text-gray-300">공지사항</Link></li>
            <li><Link to="/board"    className="pb-1 hover:opacity-70 transition border-b-2 border-transparent text-gray-300">게시판</Link></li>
            <li><Link to="/schedule" className="pb-1 hover:opacity-70 transition border-b-2 border-transparent text-gray-300">일정</Link></li>
          </ul>
          <div className="hidden md:flex items-center gap-3 text-sm text-gray-400">
            <span>
              <Link to="/universities" className="hover:text-white transition">대학교 선택</Link>
              <span className="mx-1">›</span>
              <span className="text-white font-medium">{univ.name}</span>
            </span>
            <Link to="/login" className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition">로그인</Link>
          </div>
          <button onClick={() => setMenuOpen(p => !p)} className="md:hidden text-white focus:outline-none">
            <i className="fas fa-bars text-xl" />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-black border-t border-gray-700 px-4 py-4 flex flex-col gap-4 text-sm">
            <Link to="/universities" className="hover:opacity-70 text-gray-300"><i className="fas fa-arrow-left mr-1 text-xs" />대학교 선택으로</Link>
            <Link to={`/universities/${univ.id}/schools`} className="hover:opacity-70">학부·학과 선택</Link>
            <Link to="/login" className="mt-2 border border-white text-center py-1 rounded hover:bg-white hover:text-black transition">로그인</Link>
          </div>
        )}
      </nav>

      <div className="pt-14" />

      {/* 히어로 */}
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-xs mb-3">
            <Link to="/universities" className="hover:text-gray-300 transition">대학교 선택</Link>
            <span className="mx-1">›</span>
            <span>{univ.name}</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <i className="fas fa-university mr-3" />{univ.name}
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-2">{today}</p>
          <p className="text-gray-400 text-sm md:text-base">{univ.description}</p>
          <div className="flex justify-center gap-3 mt-6">
            <span className="inline-flex items-center gap-1.5 border border-white text-white text-xs px-3 py-1.5">
              <i className="fas fa-building text-xs" />{univ.schools.length}개 단과대학
            </span>
            <span className="inline-flex items-center gap-1.5 border border-white text-white text-xs px-3 py-1.5">
              <i className="fas fa-door-open text-xs" />{univ.totalDeptCount}개 학과
            </span>
          </div>
        </div>
      </section>

      {/* 본문 */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* 학부·학과 선택 CTA */}
        <div className="border-2 border-black mb-10">
          <div className="bg-black text-white px-6 py-4 flex items-center gap-3">
            <i className="fas fa-list-ul" /><span className="font-bold">학부·학과 선택</span>
          </div>
          <div className="px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-lg font-semibold mb-1">원하는 학과를 선택하세요</p>
              <p className="text-sm text-gray-500">단과대학 → 학부 → 학과 순서로 선택하면 해당 학과 포털로 이동합니다.</p>
            </div>
            <Link
              to={`/universities/${univ.id}/schools`}
              className="flex-shrink-0 flex items-center gap-2 bg-black text-white px-8 py-3 font-bold text-sm hover:bg-gray-800 transition whitespace-nowrap"
            >
              학부·학과 선택하기 <i className="fas fa-arrow-right text-xs" />
            </Link>
          </div>
        </div>

        {/* 단과대학 미리보기 */}
        <h2 className="text-base font-bold mb-4 flex items-center gap-2 text-gray-700">
          <i className="fas fa-building text-sm" />소속 단과대학
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          {univ.schools.map(school => (
            <Link
              key={school.id}
              to={`/universities/${univ.id}/schools`}
              className="group border border-gray-200 p-4 hover:border-black hover:bg-black hover:text-white transition text-sm"
            >
              <p className="font-semibold mb-1">{school.name}</p>
              <p className="text-xs text-gray-400 group-hover:text-gray-300">
                {school.faculties.length}개 학부 · {school.faculties.reduce((sum, f) => sum + f.depts.length, 0)}개 학과
              </p>
            </Link>
          ))}
        </div>

        {/* 바로가기 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/notice',     icon: 'fa-bullhorn',      label: '공지사항' },
            { to: '/board',      icon: 'fa-comments',      label: '게시판' },
            { to: '/schedule',   icon: 'fa-calendar-alt',  label: '일정' },
            { to: '/department', icon: 'fa-university',    label: '학과정보' },
          ].map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-3 py-6 border-2 border-black hover:bg-black hover:text-white transition font-medium text-sm"
            >
              <i className={`fas ${icon} text-2xl`} />{label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add frontend/src/pages/UniversityShowPage.tsx
git commit -m "feat: implement UniversityShowPage"
```

---

## Task 14: SchoolSelectPage

**Files:**
- Modify: `frontend/src/pages/SchoolSelectPage.tsx`

- [ ] **Step 1: `frontend/src/pages/SchoolSelectPage.tsx` 구현**

```tsx
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { UniversityDto } from '../types/university'
import { fetchUniversity } from '../api/universities'
import { useDept } from '../context/DeptContext'

export default function SchoolSelectPage() {
  const { universityId } = useParams<{ universityId: string }>()
  const navigate = useNavigate()
  const { setDept } = useDept()
  const [univ, setUniv] = useState<UniversityDto | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!universityId) return
    fetchUniversity(Number(universityId)).then(setUniv).catch(() => navigate('/universities'))
  }, [universityId, navigate])

  function selectDept(deptId: number, deptName: string, schoolName: string) {
    setDept({
      selectedDeptId: deptId,
      selectedDeptName: deptName,
      selectedUniversityId: univ ? univ.id : null,
      selectedUniversityName: univ ? univ.name : null,
      selectedSchoolName: schoolName,
    })
    navigate('/')
  }

  if (!univ) return null

  return (
    <div className="bg-white text-black font-sans">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 w-full bg-black text-white z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/universities" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
            학과정보통합서비스
          </Link>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <Link to="/universities" className="hover:text-white transition">대학교 선택</Link>
            <span>›</span>
            <Link to={`/universities/${univ.id}`} className="hover:text-white transition">{univ.name}</Link>
            <span>›</span>
            <span className="text-white">학부·학과 선택</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="border border-white text-white text-sm px-3 py-1 rounded hover:bg-white hover:text-black transition">로그인</Link>
          </div>
          <button onClick={() => setMenuOpen(p => !p)} className="md:hidden text-white focus:outline-none">
            <i className="fas fa-bars text-xl" />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-black border-t border-gray-700 px-4 py-4 flex flex-col gap-3 text-sm">
            <Link to="/universities" className="text-gray-300 hover:opacity-70"><i className="fas fa-arrow-left mr-1 text-xs" />대학교 선택으로</Link>
            <Link to="/login" className="mt-2 border border-white text-center py-1 rounded hover:bg-white hover:text-black transition">로그인</Link>
          </div>
        )}
      </nav>

      <div className="pt-14" />

      {/* 히어로 */}
      <section className="bg-black text-white py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-xs mb-3">
            <Link to="/universities" className="hover:text-gray-300 transition">대학교 선택</Link>
            <span className="mx-1">›</span>
            <Link to={`/universities/${univ.id}`} className="hover:text-gray-300 transition">{univ.name}</Link>
            <span className="mx-1">›</span>
            <span>학부·학과 선택</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <i className="fas fa-list-ul mr-3" />학부·학과 선택
          </h1>
          <p className="text-gray-400 text-sm md:text-base">{univ.name} 소속 학과를 선택하세요</p>
        </div>
      </section>

      {/* 학과 선택 */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {univ.schools.map(school => (
          <div key={school.id} className="mb-14">
            <h2 className="text-xl font-bold pb-3 mb-6 border-b-2 border-black flex items-center gap-2">
              <i className="fas fa-building text-base" />{school.name}
            </h2>
            {school.faculties.map(faculty => (
              <div key={faculty.id} className="mb-8 pl-4 border-l-2 border-gray-200">
                <div className="mb-3">
                  <span className="inline-flex items-center gap-2 text-base font-semibold">
                    <i className="fas fa-layer-group text-sm text-gray-500" />
                    {faculty.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pl-6">
                  {faculty.depts.map(dept => (
                    <button
                      key={dept.id}
                      onClick={() => selectDept(dept.id, dept.name, school.name)}
                      className="border-2 border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition"
                    >
                      {dept.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add frontend/src/pages/SchoolSelectPage.tsx
git commit -m "feat: implement SchoolSelectPage with Context dept selection"
```

---

## Task 15: MainPage

**Files:**
- Modify: `frontend/src/pages/MainPage.tsx`

- [ ] **Step 1: `frontend/src/pages/MainPage.tsx` 구현**

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDept } from '../context/DeptContext'
import { fetchMainData } from '../api/universities'
import Navbar from '../components/Navbar'
import { NoticeDto } from '../types/notice'
import { PostDto } from '../types/post'
import { ScheduleDto } from '../types/schedule'

export default function MainPage() {
  const { selectedDeptName, selectedUniversityId } = useDept()
  const [notices, setNotices]     = useState<NoticeDto[]>([])
  const [posts, setPosts]         = useState<PostDto[]>([])
  const [schedules, setSchedules] = useState<ScheduleDto[]>([])
  const [today, setToday]         = useState('')

  useEffect(() => {
    fetchMainData(selectedDeptName ?? '').then(data => {
      setNotices(data.notices)
      setPosts(data.posts)
      setSchedules(data.schedules)
      setToday(data.today)
    })
  }, [selectedDeptName])

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      {/* 히어로 */}
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <i className="fas fa-graduation-cap mr-3" />
            {selectedDeptName} 정보 포털
          </h1>
          <p className="text-gray-400 text-sm md:text-base mb-6">{today}</p>
          <div className="flex justify-center flex-wrap gap-2">
            {schedules.filter(s => s.dday >= 0 && s.dday <= 14).map(s => (
              <span key={s.id} className="inline-flex items-center gap-1.5 border border-white text-white text-xs px-3 py-1.5">
                <i className="fas fa-clock text-xs" />
                {s.title}
                <strong>{s.dday === 0 ? 'D-Day' : `D-${s.dday}`}</strong>
              </span>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* 3열 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* 공지사항 카드 */}
          <div className="border-2 border-black flex flex-col">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm"><i className="fas fa-bullhorn mr-2" />최신 공지사항</span>
              <Link to="/notice" className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <ul className="flex-1 divide-y divide-gray-100">
              {notices.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm"><i className="fas fa-inbox block mb-2" />공지사항이 없습니다.</li>
              ) : notices.map(n => (
                <li key={n.id} className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2">
                  <Link to="/notice" className="text-sm font-medium hover:underline leading-snug flex-1 min-w-0 line-clamp-1">{n.title}</Link>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{n.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 인기 게시글 카드 */}
          <div className="border-2 border-black flex flex-col">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm"><i className="fas fa-fire mr-2" />인기 게시글</span>
              <Link to="/board" className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <ul className="flex-1 divide-y divide-gray-100">
              {posts.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm"><i className="fas fa-inbox block mb-2" />게시글이 없습니다.</li>
              ) : posts.map(p => (
                <li key={p.id} className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2">
                  <Link to="/board" className="text-sm font-medium hover:underline leading-snug flex-1 min-w-0 line-clamp-1">{p.title}</Link>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                    <i className="fas fa-heart text-red-400 mr-0.5" />{p.likes}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 일정 카드 */}
          <div className="border-2 border-black flex flex-col">
            <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm"><i className="fas fa-calendar-alt mr-2" />다가오는 일정</span>
              <Link to="/schedule" className="text-xs text-gray-300 hover:text-white transition">더보기 →</Link>
            </div>
            <ul className="flex-1 divide-y divide-gray-100">
              {schedules.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-400 text-sm"><i className="fas fa-calendar-xmark block mb-2" />등록된 일정이 없습니다.</li>
              ) : schedules.map(s => (
                <li key={s.id} className="px-4 py-3 hover:bg-gray-50 transition flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-1">{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.date}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-black text-white flex-shrink-0 whitespace-nowrap">
                    {s.dday === 0 ? 'D-Day' : `D-${s.dday}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 바로가기 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/notice',     icon: 'fa-bullhorn',     label: '공지사항' },
            { to: '/board',      icon: 'fa-comments',     label: '게시판' },
            { to: '/schedule',   icon: 'fa-calendar-alt', label: '일정' },
            { to: '/department', icon: 'fa-university',   label: '학과정보' },
          ].map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-3 py-6 border-2 border-black hover:bg-black hover:text-white transition font-medium text-sm"
            >
              <i className={`fas ${icon} text-2xl`} />{label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add frontend/src/pages/MainPage.tsx
git commit -m "feat: implement MainPage dashboard"
```

---

## Task 16: NoticePage

**Files:**
- Modify: `frontend/src/pages/NoticePage.tsx`

- [ ] **Step 1: 테스트 작성 — `frontend/src/pages/NoticePage.test.tsx`**

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import NoticePage from './NoticePage'

vi.mock('../api/notices', () => ({
  fetchNotices: () => Promise.resolve({
    featured: { id: 1, title: '긴급 공지', date: '2026-05-11', author: '학과', category: '학사', viewCount: 215, featured: true },
    notices: [
      { id: 1, title: '공지 제목1', date: '2026-05-11', author: '학과', category: '학사', viewCount: 100, featured: false },
      { id: 2, title: '공지 제목2', date: '2026-05-10', author: '학과', category: '장학', viewCount: 50,  featured: false },
    ],
  }),
}))

function renderPage() {
  return render(<MemoryRouter><NoticePage /></MemoryRouter>)
}

test('공지 목록이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('공지 제목1')).toBeInTheDocument()
    expect(screen.getByText('공지 제목2')).toBeInTheDocument()
  })
})

test('학사 탭 클릭 시 학사 공지만 표시된다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('공지 제목1'))

  fireEvent.click(screen.getByText('학사'))
  expect(screen.getByText('공지 제목1')).toBeVisible()
  expect(screen.queryByText('공지 제목2')).not.toBeVisible()
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd frontend && npx vitest run src/pages/NoticePage.test.tsx
```

Expected: FAIL

- [ ] **Step 3: `frontend/src/pages/NoticePage.tsx` 구현**

```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FilterTabs from '../components/FilterTabs'
import FeaturedCard from '../components/FeaturedCard'
import Sidebar from '../components/Sidebar'
import Pagination from '../components/Pagination'
import { fetchNotices } from '../api/notices'
import { NoticeDto } from '../types/notice'

const NOTICE_TABS = ['전체', '학사', '장학', '행사', '취업']
const CATEGORY_COUNTS = [
  { label: '전체', count: 32 }, { label: '학사', count: 14 },
  { label: '장학', count: 8 },  { label: '행사', count: 6 },
  { label: '취업', count: 4 },
]

export default function NoticePage() {
  const [featured, setFeatured] = useState<NoticeDto | null>(null)
  const [notices, setNotices]   = useState<NoticeDto[]>([])
  const [active, setActive]     = useState('전체')

  useEffect(() => {
    fetchNotices().then(data => {
      setFeatured(data.featured)
      setNotices(data.notices)
    })
  }, [])

  const filtered = active === '전체' ? notices : notices.filter(n => n.category === active)

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {featured && (
          <FeaturedCard
            category={featured.category}
            title={featured.title}
            date={featured.date}
            meta={`👁 ${featured.viewCount}`}
          />
        )}

        <FilterTabs tabs={NOTICE_TABS} active={active} onChange={setActive} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 공지 목록 */}
          <div className="flex-1">
            {filtered.map(notice => (
              <div
                key={notice.id}
                data-category={notice.category}
                className="flex gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="w-20 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center border border-gray-300">
                  <i className="fas fa-image text-gray-400 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to="/notice" className="font-semibold text-black hover:underline block leading-snug line-clamp-2">
                    {notice.title}
                  </Link>
                  <div className="flex items-center flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="border border-black text-black px-1.5 py-0.5 font-medium">{notice.category}</span>
                    <span>{notice.date}</span>
                    <span><i className="fas fa-eye mr-0.5" />{notice.viewCount}</span>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <i className="fas fa-inbox text-3xl mb-3 block" />공지사항이 없습니다.
              </div>
            )}
            <Pagination current={1} total={10} onChange={() => {}} />
          </div>

          {/* 사이드바 */}
          <Sidebar
            categoryWidget={{
              title: '카테고리',
              items: CATEGORY_COUNTS,
              onSelect: setActive,
            }}
            recentWidget={{
              title: '최근 공지',
              items: notices.slice(0, 5).map(n => ({ title: n.title, sub: n.date })),
            }}
          />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/pages/NoticePage.test.tsx
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
cd .. && git add frontend/src/pages/NoticePage.tsx frontend/src/pages/NoticePage.test.tsx
git commit -m "feat: implement NoticePage with category filter"
```

---

## Task 17: BoardPage

**Files:**
- Modify: `frontend/src/pages/BoardPage.tsx`

- [ ] **Step 1: 테스트 작성 — `frontend/src/pages/BoardPage.test.tsx`**

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import BoardPage from './BoardPage'

vi.mock('../api/posts', () => ({
  fetchPosts: () => Promise.resolve({
    featured: { id: 1, title: '인기글', date: '2026-05-01', author: '홍길동', likes: 45, category: '자유게시판', viewCount: 312, featured: true, commentCount: 18 },
    posts: [
      { id: 1, title: '자료구조 족보', date: '2026-05-01', author: '박민수', likes: 45, category: '자유게시판', viewCount: 312, featured: false, commentCount: 18 },
      { id: 2, title: '스터디 모집',   date: '2026-04-25', author: '홍길동', likes: 24, category: '스터디',    viewCount: 150, featured: false, commentCount:  7 },
    ],
  }),
}))

function renderPage() {
  return render(<MemoryRouter><BoardPage /></MemoryRouter>)
}

test('게시글 목록이 렌더링된다', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('자료구조 족보')).toBeInTheDocument()
    expect(screen.getByText('스터디 모집')).toBeInTheDocument()
  })
})

test('제목 검색으로 필터링된다', async () => {
  renderPage()
  await waitFor(() => screen.getByText('자료구조 족보'))

  fireEvent.change(screen.getByPlaceholderText('제목으로 검색...'), { target: { value: '스터디' } })
  expect(screen.queryByText('자료구조 족보')).not.toBeInTheDocument()
  expect(screen.getByText('스터디 모집')).toBeInTheDocument()
})
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd frontend && npx vitest run src/pages/BoardPage.test.tsx
```

Expected: FAIL

- [ ] **Step 3: `frontend/src/pages/BoardPage.tsx` 구현**

```tsx
import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FilterTabs from '../components/FilterTabs'
import FeaturedCard from '../components/FeaturedCard'
import Sidebar from '../components/Sidebar'
import Pagination from '../components/Pagination'
import { fetchPosts } from '../api/posts'
import { PostDto } from '../types/post'

const BOARD_TABS  = ['전체', '자유게시판', '질문', '스터디', '취업후기']
const SORT_OPTIONS = ['최신순', '추천순', '댓글순']
const CATEGORY_COUNTS = [
  { label: '전체', count: 9 }, { label: '자유게시판', count: 3 },
  { label: '질문',  count: 1 }, { label: '스터디',    count: 2 },
  { label: '취업후기', count: 3 },
]

export default function BoardPage() {
  const [featured, setFeatured] = useState<PostDto | null>(null)
  const [posts, setPosts]       = useState<PostDto[]>([])
  const [active, setActive]     = useState('전체')
  const [sort, setSort]         = useState('최신순')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    fetchPosts().then(data => {
      setFeatured(data.featured)
      setPosts(data.posts)
    })
  }, [])

  const filtered = useMemo(() => {
    let result = posts.filter(p => {
      const catOk    = active === '전체' || p.category === active
      const searchOk = search === '' || p.title.toLowerCase().includes(search.toLowerCase())
      return catOk && searchOk
    })
    if (sort === '최신순') result = [...result].sort((a, b) => b.date.localeCompare(a.date))
    if (sort === '추천순') result = [...result].sort((a, b) => b.likes - a.likes)
    if (sort === '댓글순') result = [...result].sort((a, b) => b.commentCount - a.commentCount)
    return result
  }, [posts, active, sort, search])

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {featured && (
          <FeaturedCard
            category={featured.category}
            title={featured.title}
            date={featured.date}
            meta={`❤ ${featured.likes}`}
          />
        )}

        {/* 검색창 */}
        <div className="mb-4">
          <div className="flex items-center border border-black">
            <i className="fas fa-search px-3 text-gray-400" />
            <input
              type="text"
              placeholder="제목으로 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 py-2 pr-4 text-sm outline-none bg-white"
            />
          </div>
        </div>

        {/* 필터 + 정렬 */}
        <div className="flex flex-wrap items-center gap-y-2 mb-6">
          <div className="flex flex-wrap gap-2">
            {BOARD_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-4 py-1.5 text-sm border border-black font-medium transition ${
                  active === tab ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => setSort(opt)}
                className={`px-3 py-1.5 text-sm border border-black font-medium transition ${
                  sort === opt ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 게시글 목록 */}
          <div className="flex-1">
            {filtered.map(post => (
              <div key={post.id} className="flex gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer">
                <div className="w-20 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center border border-gray-300">
                  <i className="fas fa-image text-gray-400 text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to="/board" className="font-semibold text-black hover:underline block leading-snug line-clamp-2">{post.title}</Link>
                  <div className="flex items-center flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="border border-black text-black px-1.5 py-0.5 font-medium">{post.category}</span>
                    <span>{post.date}</span>
                    <span><i className="fas fa-heart mr-0.5 text-red-400" />{post.likes}</span>
                    <span><i className="fas fa-comment mr-0.5" />{post.commentCount}</span>
                    <span><i className="fas fa-eye mr-0.5" />{post.viewCount}</span>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <i className="fas fa-inbox text-3xl mb-3 block" />게시글이 없습니다.
              </div>
            )}
            <Pagination current={1} total={10} onChange={() => {}} />
          </div>

          <Sidebar
            categoryWidget={{
              title: '카테고리',
              items: CATEGORY_COUNTS,
              onSelect: setActive,
            }}
            recentWidget={{
              title: '인기 게시글 TOP 5',
              items: [...posts].sort((a, b) => b.likes - a.likes).slice(0, 5).map(p => ({
                title: p.title,
                sub: `❤ ${p.likes}`,
              })),
            }}
          />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/pages/BoardPage.test.tsx
```

Expected: PASS

- [ ] **Step 5: 커밋**

```bash
cd .. && git add frontend/src/pages/BoardPage.tsx frontend/src/pages/BoardPage.test.tsx
git commit -m "feat: implement BoardPage with filter, sort, search"
```

---

## Task 18: SchedulePage

**Files:**
- Modify: `frontend/src/pages/SchedulePage.tsx`

- [ ] **Step 1: `frontend/src/pages/SchedulePage.tsx` 구현**

```tsx
import { useEffect, useState, useMemo } from 'react'
import Navbar from '../components/Navbar'
import FilterTabs from '../components/FilterTabs'
import Sidebar from '../components/Sidebar'
import { fetchSchedules } from '../api/schedules'
import { ScheduleDto } from '../types/schedule'

const SCHEDULE_TABS = ['전체', '학사', '행사', '시험', '기타']
const MONTH_COUNTS  = [
  { label: '전체', count: 12 }, { label: '학사', count: 5 },
  { label: '행사', count: 2 },  { label: '시험', count: 3 },
  { label: '기타', count: 2 },
]

function groupByMonth(items: ScheduleDto[]): Map<string, ScheduleDto[]> {
  const map = new Map<string, ScheduleDto[]>()
  items.forEach(item => {
    const month = item.date.slice(0, 7)
    if (!map.has(month)) map.set(month, [])
    map.get(month)!.push(item)
  })
  return map
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleDto[]>([])
  const [active, setActive]       = useState('전체')

  useEffect(() => {
    fetchSchedules().then(setSchedules)
  }, [])

  const filtered = active === '전체' ? schedules : schedules.filter(s => s.category === active)
  const grouped  = useMemo(() => groupByMonth(filtered), [filtered])

  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <FilterTabs tabs={SCHEDULE_TABS} active={active} onChange={setActive} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 일정 목록 */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <i className="fas fa-calendar-xmark text-3xl mb-3 block" />등록된 일정이 없습니다.
              </div>
            ) : Array.from(grouped.entries()).map(([month, items]) => (
              <div key={month}>
                {/* 월 헤더 */}
                <div className="text-base font-bold py-3 px-1 mt-4 border-b-2 border-black flex items-center gap-2">
                  <i className="fas fa-caret-right" />
                  {month.slice(0, 4)}년 {month.slice(5, 7)}월
                </div>
                {items.map(s => (
                  <div key={s.id} className="flex items-start gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition">
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-2xl font-bold leading-none">{s.date.slice(8, 10)}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.date.slice(5, 7)}월</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold leading-snug">{s.title}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 bg-black text-white">
                          {s.dday === 0 ? 'D-Day' : `D-${s.dday}`}
                        </span>
                        <span className="text-xs border border-black px-1.5 py-0.5 font-medium">{s.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <Sidebar
            categoryWidget={{
              title: '이번 달 일정',
              items: MONTH_COUNTS,
              onSelect: setActive,
            }}
            recentWidget={{
              title: 'D-Day 임박 TOP 5',
              items: schedules.slice(0, 5).map(s => ({
                title: s.title,
                sub: `${s.dday === 0 ? 'D-Day' : `D-${s.dday}`}  ${s.date}`,
              })),
            }}
          />
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add frontend/src/pages/SchedulePage.tsx
git commit -m "feat: implement SchedulePage with month grouping and category filter"
```

---

## Task 19: DepartmentPage

**Files:**
- Modify: `frontend/src/pages/DepartmentPage.tsx`

- [ ] **Step 1: `frontend/src/pages/DepartmentPage.tsx` 구현**

```tsx
import Navbar from '../components/Navbar'

const PROFESSORS = [
  { name: '김○○ 교수', specialty: '전공: 인공지능 / 머신러닝', email: 'professor1@mokpo.ac.kr' },
  { name: '이○○ 교수', specialty: '전공: 데이터베이스 / 빅데이터', email: 'professor2@mokpo.ac.kr' },
  { name: '박○○ 교수', specialty: '전공: 네트워크 / 보안', email: 'professor3@mokpo.ac.kr' },
  { name: '최○○ 교수', specialty: '전공: 소프트웨어공학', email: 'professor4@mokpo.ac.kr' },
  { name: '정○○ 교수', specialty: '전공: 컴퓨터 비전 / 영상처리', email: 'professor5@mokpo.ac.kr' },
  { name: '한○○ 교수', specialty: '전공: 알고리즘 / 이론컴퓨팅', email: 'professor6@mokpo.ac.kr' },
]

const CURRICULUM = [
  { name: '자료구조',      year: '1학년', required: true,  credit: 3 },
  { name: '알고리즘 분석', year: '2학년', required: true,  credit: 3 },
  { name: '운영체제',      year: '2학년', required: true,  credit: 3 },
  { name: '데이터베이스',  year: '2학년', required: true,  credit: 3 },
  { name: '웹 프로그래밍', year: '3학년', required: false, credit: 3 },
  { name: '인공지능 개론', year: '3학년', required: false, credit: 3 },
  { name: '소프트웨어공학',year: '3학년', required: true,  credit: 3 },
  { name: '졸업프로젝트',  year: '4학년', required: true,  credit: 4 },
]

export default function DepartmentPage() {
  return (
    <div className="bg-white text-black font-sans">
      <Navbar />
      <div className="pt-14" />

      <main>
        {/* 학과 소개 */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6 pb-3 border-b-2 border-black">학과 소개</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                컴퓨터공학과는 소프트웨어·하드웨어·네트워크 전반의 핵심 역량을 갖춘 창의적 인재를 양성하는 학과입니다.
                이론과 실무를 균형 있게 교육하여 산업 현장에서 즉시 활약할 수 있는 전문가를 배출합니다.
              </p>
              <p className="text-gray-700 leading-relaxed">
                본 학과는 알고리즘·운영체제·데이터베이스·인공지능·웹 프로그래밍 등 폭넓은 교과과정을 운영하며,
                산학협력 프로젝트·교내 해커톤·연구실 인턴십 등 다양한 비교과 활동을 통해 학생들의 실전 역량을 강화합니다.
              </p>
            </div>
            <div className="lg:w-96 w-full h-64 bg-gray-200 border-2 border-black flex items-center justify-center flex-shrink-0">
              <div className="text-center text-gray-400">
                <i className="fas fa-image text-4xl mb-2 block" />
                <span className="text-sm">학과 사진</span>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-gray-200" />

        {/* 교수진 */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 pb-3 border-b-2 border-black">교수진</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROFESSORS.map(prof => (
              <div key={prof.email} className="border-2 border-black p-6 flex gap-4 items-start hover:bg-gray-50 transition">
                <div className="w-16 h-16 bg-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0 rounded-full">
                  <i className="fas fa-user text-2xl text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-lg">{prof.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{prof.specialty}</p>
                  <p className="text-xs text-gray-400 mt-1">{prof.email}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-gray-200" />

        {/* 교육과정 */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 pb-3 border-b-2 border-black">교육과정</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-black text-sm">
              <thead>
                <tr className="bg-black text-white">
                  <th className="px-4 py-3 text-left font-medium border-r border-gray-700">과목명</th>
                  <th className="px-4 py-3 text-center font-medium border-r border-gray-700">학년</th>
                  <th className="px-4 py-3 text-center font-medium border-r border-gray-700">구분</th>
                  <th className="px-4 py-3 text-center font-medium">학점</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {CURRICULUM.map(c => (
                  <tr key={c.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium border-r border-gray-200">{c.name}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">{c.year}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">
                      {c.required
                        ? <span className="border border-black px-1.5 py-0.5 text-xs font-medium">필수</span>
                        : <span className="text-gray-500 text-xs">선택</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-center">{c.credit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="border-t border-gray-200" />

        {/* 위치 및 연락정보 */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 pb-3 border-b-2 border-black">위치 및 연락정보</h2>
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:flex-1 h-72 bg-gray-200 border-2 border-black flex items-center justify-center">
              <div className="text-center text-gray-400">
                <i className="fas fa-map-location-dot text-4xl mb-2 block" />
                <span className="text-sm">지도 영역 (API 연동 예정)</span>
              </div>
            </div>
            <div className="lg:w-80 flex flex-col gap-4 justify-center">
              {[
                { icon: 'fa-location-dot', label: '주소',    value: '전남 목포시 영산로 1666\n국립목포대학교 공과대학 ○○호' },
                { icon: 'fa-phone',        label: '전화',    value: '061-450-XXXX' },
                { icon: 'fa-envelope',     label: '이메일',  value: 'cs-dept@mokpo.ac.kr' },
                { icon: 'fa-clock',        label: '운영시간', value: '평일 09:00 ~ 18:00\n(점심 12:00 ~ 13:00)' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <i className={`fas ${icon} text-lg mt-0.5 flex-shrink-0`} />
                  <div>
                    <p className="font-semibold text-sm mb-0.5">{label}</p>
                    <p className="text-gray-600 text-sm whitespace-pre-line">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add frontend/src/pages/DepartmentPage.tsx
git commit -m "feat: implement DepartmentPage (static)"
```

---

## Task 20: LoginPage

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`

- [ ] **Step 1: `frontend/src/pages/LoginPage.tsx` 구현**

```tsx
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function LoginPage() {
  return (
    <div className="bg-white text-black font-sans">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-4 pt-14">
        <div className="w-full max-w-sm border-2 border-black p-8">
          <h1 className="text-2xl font-bold text-center mb-2">학과정보통합서비스</h1>
          <p className="text-center text-gray-500 text-sm mb-6">학과 포털 로그인</p>
          <div className="border-t border-black mb-6" />

          <form onSubmit={e => e.preventDefault()}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="username">아이디</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="학번 또는 아이디 입력"
                className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50 transition"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1" htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="비밀번호 입력"
                className="w-full border-2 border-black px-3 py-2 text-sm outline-none focus:bg-gray-50 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2.5 text-sm font-bold hover:opacity-80 transition"
            >
              로그인
            </button>
          </form>

          <div className="border-t border-gray-200 mt-6 pt-4" />
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <Link to="/register" className="hover:text-black hover:underline transition">회원가입</Link>
            <span className="text-gray-300">|</span>
            <Link to="/forgot-password" className="hover:text-black hover:underline transition">비밀번호 찾기</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 커밋**

```bash
git add frontend/src/pages/LoginPage.tsx
git commit -m "feat: implement LoginPage (UI only)"
```

---

## Task 21: 최종 통합 확인

- [ ] **Step 1: 전체 테스트 실행**

```bash
cd frontend && npx vitest run
```

Expected: 모든 테스트 PASS

- [ ] **Step 2: TypeScript 타입 체크**

```bash
cd frontend && npx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 3: 프로덕션 빌드 확인**

```bash
cd frontend && npm run build
```

Expected: `dist/` 생성, 에러 없음

- [ ] **Step 4: 개발 서버 동시 실행 확인**

터미널 1 — Spring Boot:
```bash
cd demo/demo && ./mvnw spring-boot:run
```

터미널 2 — Vite:
```bash
cd frontend && npm run dev
```

브라우저에서 `http://localhost:5173` 접속 후 확인:
- `/universities` → 대학교 카드 2개 표시
- 대학교 선택 → 학과 선택 → `/` 메인 페이지 이동
- 각 메뉴 (`/notice`, `/board`, `/schedule`, `/department`) 정상 렌더링
- `/board` 검색·필터·정렬 동작

- [ ] **Step 5: 최종 커밋**

```bash
cd .. && git add . && git commit -m "feat: complete React SPA migration"
```
