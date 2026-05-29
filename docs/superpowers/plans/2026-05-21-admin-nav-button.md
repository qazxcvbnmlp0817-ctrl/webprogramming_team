# Admin Navigation Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a role-gated admin banner with a navigation button to three page scopes (selection / school / dept), visible only to the matching admin tier.

**Architecture:** A new `useAdminRole` hook reads `adminRole` from `sessionStorage`. A shared `AdminBanner` component uses that hook plus a `scope` prop to determine visibility and destination URL. The component is dropped into each target page below the hero section. Three placeholder admin pages and a `ProtectedAdmin` route wrapper are added.

**Tech Stack:** React 19, TypeScript, React Router v7, Tailwind CSS, Vitest + @testing-library/react (jsdom)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/hooks/useAdminRole.ts` | Read `adminRole` from sessionStorage, re-read on `loginChanged` |
| Create | `src/hooks/useAdminRole.test.ts` | Unit tests for the hook |
| Create | `src/components/common/AdminBanner.tsx` | Conditional banner + navigate button |
| Create | `src/components/common/AdminBanner.test.tsx` | Render + navigation tests |
| Create | `src/pages/admin/SuperAdminPage.tsx` | Placeholder for `/admin/super` |
| Create | `src/pages/admin/SchoolAdminPage.tsx` | Placeholder for `/admin/school/:id` |
| Create | `src/pages/admin/DeptAdminPage.tsx` | Placeholder for `/admin/dept/:id` |
| Modify | `src/pages/LoginPage.tsx` | Store `adminRole` from API response |
| Modify | `src/App.tsx` | Add `ProtectedAdmin` + 3 admin routes |
| Modify | `src/pages/UniversityListPage.tsx` | `<AdminBanner scope="selection">` |
| Modify | `src/pages/UniversityShowPage.tsx` | `<AdminBanner scope="school">` |
| Modify | `src/pages/SchoolDepartmentsPage.tsx` | `<AdminBanner scope="school">` |
| Modify | `src/pages/SchoolInfoPage.tsx` | `<AdminBanner scope="school">` |
| Modify | `src/pages/FacultyPage.tsx` | `<AdminBanner scope="school">` |
| Modify | `src/pages/SchoolNoticePage.tsx` | `<AdminBanner scope="school">` |
| Modify | `src/pages/SchoolBoardPage.tsx` | `<AdminBanner scope="school">` |
| Modify | `src/pages/SchoolSchedulePage.tsx` | `<AdminBanner scope="school">` |
| Modify | `src/pages/MainPage.tsx` | `<AdminBanner scope="dept">` |
| Modify | `src/pages/BoardPage.tsx` | `<AdminBanner scope="dept">` |
| Modify | `src/pages/NoticePage.tsx` | `<AdminBanner scope="dept">` |
| Modify | `src/pages/SchedulePage.tsx` | `<AdminBanner scope="dept">` |
| Modify | `src/pages/DepartmentPage.tsx` | `<AdminBanner scope="dept">` |

---

## Task 1: `useAdminRole` hook

**Files:**
- Create: `frontend/src/hooks/useAdminRole.ts`
- Create: `frontend/src/hooks/useAdminRole.test.ts`

- [x] **Step 1: Write the failing tests**

`frontend/src/hooks/useAdminRole.test.ts`:
```ts
import { renderHook, act } from '@testing-library/react'
import { useAdminRole } from './useAdminRole'

beforeEach(() => sessionStorage.clear())

test('로그인 안 된 상태에서 null 반환', () => {
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBeNull()
})

test('student로 로그인 시 null 반환', () => {
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('memberType', 'student')
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBeNull()
})

test('SUPER_ADMIN 반환', () => {
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('adminRole', 'SUPER_ADMIN')
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBe('SUPER_ADMIN')
})

test('SCHOOL_ADMIN 반환', () => {
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('adminRole', 'SCHOOL_ADMIN')
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBe('SCHOOL_ADMIN')
})

test('DEPT_ADMIN 반환', () => {
  sessionStorage.setItem('isLoggedIn', 'true')
  sessionStorage.setItem('adminRole', 'DEPT_ADMIN')
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBe('DEPT_ADMIN')
})

test('loginChanged 이벤트 발생 시 역할 갱신', () => {
  const { result } = renderHook(() => useAdminRole())
  expect(result.current).toBeNull()

  act(() => {
    sessionStorage.setItem('isLoggedIn', 'true')
    sessionStorage.setItem('adminRole', 'SUPER_ADMIN')
    window.dispatchEvent(new Event('loginChanged'))
  })

  expect(result.current).toBe('SUPER_ADMIN')
})
```

- [x] **Step 2: 테스트가 실패하는지 확인**

```bash
cd frontend && npx vitest run src/hooks/useAdminRole.test.ts
```
Expected: FAIL with "Cannot find module './useAdminRole'"

- [x] **Step 3: 훅 구현**

`frontend/src/hooks/useAdminRole.ts`:
```ts
import { useEffect, useState } from 'react'

export type AdminRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'DEPT_ADMIN' | null

function readAdminRole(): AdminRole {
  if (typeof window === 'undefined') return null
  if (sessionStorage.getItem('isLoggedIn') !== 'true') return null
  const raw = sessionStorage.getItem('adminRole') ?? ''
  if (raw === 'SUPER_ADMIN') return 'SUPER_ADMIN'
  if (raw === 'SCHOOL_ADMIN') return 'SCHOOL_ADMIN'
  if (raw === 'DEPT_ADMIN') return 'DEPT_ADMIN'
  return null
}

export function useAdminRole(): AdminRole {
  const [role, setRole] = useState<AdminRole>(readAdminRole)
  useEffect(() => {
    const handler = () => setRole(readAdminRole())
    window.addEventListener('loginChanged', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('loginChanged', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])
  return role
}
```

- [x] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/hooks/useAdminRole.test.ts
```
Expected: PASS (6 tests)

---

## Task 2: `AdminBanner` 컴포넌트

**Files:**
- Create: `frontend/src/components/common/AdminBanner.tsx`
- Create: `frontend/src/components/common/AdminBanner.test.tsx`

- [x] **Step 1: 테스트 작성**

`frontend/src/components/common/AdminBanner.test.tsx`:
```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import AdminBanner from './AdminBanner'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function setup(
  scope: 'selection' | 'school' | 'dept',
  adminRole?: string,
  targetId?: number,
) {
  sessionStorage.clear()
  if (adminRole) {
    sessionStorage.setItem('isLoggedIn', 'true')
    sessionStorage.setItem('adminRole', adminRole)
  }
  return render(
    <MemoryRouter>
      <AdminBanner scope={scope} targetId={targetId} />
    </MemoryRouter>,
  )
}

beforeEach(() => mockNavigate.mockClear())

test('비어있음 — 비로그인', () => {
  setup('dept')
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('비어있음 — DEPT_ADMIN on selection', () => {
  setup('selection', 'DEPT_ADMIN')
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('비어있음 — SCHOOL_ADMIN on selection', () => {
  setup('selection', 'SCHOOL_ADMIN')
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('비어있음 — DEPT_ADMIN on school', () => {
  setup('school', 'DEPT_ADMIN', 2)
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('표시 — SUPER_ADMIN on selection, 배지 최고 관리자', () => {
  setup('selection', 'SUPER_ADMIN')
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByText('최고 관리자')).toBeInTheDocument()
})

test('표시 — SCHOOL_ADMIN on school, 배지 학교 관리자', () => {
  setup('school', 'SCHOOL_ADMIN', 2)
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByText('학교 관리자')).toBeInTheDocument()
})

test('표시 — SUPER_ADMIN on school', () => {
  setup('school', 'SUPER_ADMIN', 2)
  expect(screen.getByRole('button')).toBeInTheDocument()
})

test('표시 — DEPT_ADMIN on dept, 배지 학과 관리자', () => {
  setup('dept', 'DEPT_ADMIN', 5)
  expect(screen.getByRole('button')).toBeInTheDocument()
  expect(screen.getByText('학과 관리자')).toBeInTheDocument()
})

test('표시 — SCHOOL_ADMIN on dept', () => {
  setup('dept', 'SCHOOL_ADMIN', 5)
  expect(screen.getByRole('button')).toBeInTheDocument()
})

test('navigate → /admin/super (selection)', () => {
  setup('selection', 'SUPER_ADMIN')
  fireEvent.click(screen.getByRole('button'))
  expect(mockNavigate).toHaveBeenCalledWith('/admin/super')
})

test('navigate → /admin/school/3 (school)', () => {
  setup('school', 'SUPER_ADMIN', 3)
  fireEvent.click(screen.getByRole('button'))
  expect(mockNavigate).toHaveBeenCalledWith('/admin/school/3')
})

test('navigate → /admin/dept/7 (dept)', () => {
  setup('dept', 'DEPT_ADMIN', 7)
  fireEvent.click(screen.getByRole('button'))
  expect(mockNavigate).toHaveBeenCalledWith('/admin/dept/7')
})
```

- [x] **Step 2: 테스트 실패 확인**

```bash
cd frontend && npx vitest run src/components/common/AdminBanner.test.tsx
```
Expected: FAIL with "Cannot find module './AdminBanner'"

- [x] **Step 3: 컴포넌트 구현**

`frontend/src/components/common/AdminBanner.tsx`:
```tsx
import { useNavigate } from 'react-router-dom'
import { useAdminRole } from '../../hooks/useAdminRole'
import type { AdminRole } from '../../hooks/useAdminRole'

export type AdminBannerScope = 'selection' | 'school' | 'dept'

interface AdminBannerProps {
  scope: AdminBannerScope
  targetId?: number
}

const ALLOWED: Record<AdminBannerScope, AdminRole[]> = {
  selection: ['SUPER_ADMIN'],
  school:    ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  dept:      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DEPT_ADMIN'],
}

const ROLE_LABELS: Record<NonNullable<AdminRole>, string> = {
  SUPER_ADMIN:  '최고 관리자',
  SCHOOL_ADMIN: '학교 관리자',
  DEPT_ADMIN:   '학과 관리자',
}

function adminUrl(scope: AdminBannerScope, targetId?: number): string {
  if (scope === 'selection') return '/admin/super'
  if (scope === 'school') return `/admin/school/${targetId ?? ''}`
  return `/admin/dept/${targetId ?? ''}`
}

export default function AdminBanner({ scope, targetId }: AdminBannerProps) {
  const role = useAdminRole()
  const navigate = useNavigate()

  if (!role || !ALLOWED[scope].includes(role)) return null

  return (
    <section className="max-w-6xl mx-auto px-4 py-3">
      <div className="border border-gray-300 bg-gray-50 px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <i className="fas fa-shield-halved text-gray-500" />
          <span className="inline-flex items-center border border-gray-400 px-2 py-0.5 text-xs font-bold text-gray-600">
            {ROLE_LABELS[role]}
          </span>
          <p className="text-sm text-gray-600 font-medium hidden sm:block">관리자 메뉴</p>
        </div>
        <button
          onClick={() => navigate(adminUrl(scope, targetId))}
          className="shrink-0 border-2 border-black px-4 py-1.5 text-sm font-bold hover:bg-black hover:text-white transition"
        >
          관리자 페이지 <i className="fas fa-arrow-right ml-1" />
        </button>
      </div>
    </section>
  )
}
```

- [x] **Step 4: 테스트 통과 확인**

```bash
cd frontend && npx vitest run src/components/common/AdminBanner.test.tsx
```
Expected: PASS (13 tests)

---

## Task 3: 어드민 플레이스홀더 페이지 3개

**Files:**
- Create: `frontend/src/pages/admin/SuperAdminPage.tsx`
- Create: `frontend/src/pages/admin/SchoolAdminPage.tsx`
- Create: `frontend/src/pages/admin/DeptAdminPage.tsx`

- [x] **Step 1: SuperAdminPage 생성**

`frontend/src/pages/admin/SuperAdminPage.tsx`:
```tsx
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

export default function SuperAdminPage() {
  const navigate = useNavigate()
  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-gray-500 mb-3">관리자</p>
          <h1 className="text-3xl font-bold mb-2">
            <i className="fas fa-shield-halved mr-3" />최고 관리자 페이지
          </h1>
          <p className="text-gray-400 text-sm">SUPER_ADMIN 전용</p>
        </div>
      </section>
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="border-2 border-dashed border-gray-300 py-20 text-gray-400">
          <i className="fas fa-tools text-4xl mb-4 block" />
          <p className="text-lg font-bold">관리자 페이지 준비 중</p>
          <p className="text-sm mt-2">페이지 상세 내용은 추후 제공됩니다.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-8 border-2 border-black px-6 py-2 text-sm font-bold hover:bg-black hover:text-white transition"
        >
          <i className="fas fa-arrow-left mr-2" />뒤로
        </button>
      </main>
    </div>
  )
}
```

- [x] **Step 2: SchoolAdminPage 생성**

`frontend/src/pages/admin/SchoolAdminPage.tsx`:
```tsx
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'

export default function SchoolAdminPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-gray-500 mb-3">관리자</p>
          <h1 className="text-3xl font-bold mb-2">
            <i className="fas fa-shield-halved mr-3" />학교 관리자 페이지
          </h1>
          <p className="text-gray-400 text-sm">School ID: {id}</p>
        </div>
      </section>
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="border-2 border-dashed border-gray-300 py-20 text-gray-400">
          <i className="fas fa-tools text-4xl mb-4 block" />
          <p className="text-lg font-bold">관리자 페이지 준비 중</p>
          <p className="text-sm mt-2">페이지 상세 내용은 추후 제공됩니다.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-8 border-2 border-black px-6 py-2 text-sm font-bold hover:bg-black hover:text-white transition"
        >
          <i className="fas fa-arrow-left mr-2" />뒤로
        </button>
      </main>
    </div>
  )
}
```

- [x] **Step 3: DeptAdminPage 생성**

`frontend/src/pages/admin/DeptAdminPage.tsx`:
```tsx
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'

export default function DeptAdminPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-gray-500 mb-3">관리자</p>
          <h1 className="text-3xl font-bold mb-2">
            <i className="fas fa-shield-halved mr-3" />학과 관리자 페이지
          </h1>
          <p className="text-gray-400 text-sm">Dept ID: {id}</p>
        </div>
      </section>
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="border-2 border-dashed border-gray-300 py-20 text-gray-400">
          <i className="fas fa-tools text-4xl mb-4 block" />
          <p className="text-lg font-bold">관리자 페이지 준비 중</p>
          <p className="text-sm mt-2">페이지 상세 내용은 추후 제공됩니다.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-8 border-2 border-black px-6 py-2 text-sm font-bold hover:bg-black hover:text-white transition"
        >
          <i className="fas fa-arrow-left mr-2" />뒤로
        </button>
      </main>
    </div>
  )
}
```

---

## Task 4: LoginPage — `adminRole` sessionStorage 저장

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`

- [x] **Step 1: 로그인 핸들러에 한 줄 추가**

`frontend/src/pages/LoginPage.tsx`의 `result.success` 블록에서 `sessionStorage.setItem('grade', ...)` 바로 아래에 추가:

```tsx
// 기존 코드 (변경 없음)
sessionStorage.setItem('grade', result.grade != null ? String(result.grade) : '')
// 추가할 줄
sessionStorage.setItem('adminRole', result.adminRole ?? '')
```

변경 전:
```tsx
sessionStorage.setItem('grade', result.grade != null ? String(result.grade) : '')
window.dispatchEvent(new Event('loginChanged'))
```

변경 후:
```tsx
sessionStorage.setItem('grade', result.grade != null ? String(result.grade) : '')
sessionStorage.setItem('adminRole', result.adminRole ?? '')
window.dispatchEvent(new Event('loginChanged'))
```

- [x] **Step 2: 수동 확인**

백엔드가 아직 `adminRole` 필드를 반환하지 않는 경우 `result.adminRole`은 `undefined` → `''`으로 저장되어 `useAdminRole`은 `null`을 반환함. 기존 동작에 영향 없음.

---

## Task 5: App.tsx — 어드민 라우트 + ProtectedAdmin

**Files:**
- Modify: `frontend/src/App.tsx`

- [x] **Step 1: import 추가**

`App.tsx` 상단 import 블록 마지막에 추가:
```tsx
import SuperAdminPage  from './pages/admin/SuperAdminPage'
import SchoolAdminPage from './pages/admin/SchoolAdminPage'
import DeptAdminPage   from './pages/admin/DeptAdminPage'
```

- [x] **Step 2: ProtectedAdmin 래퍼 추가**

`ProtectedDept` 함수 바로 아래에 추가:
```tsx
function ProtectedAdmin({ children }: { children: ReactNode }) {
  const role = sessionStorage.getItem('adminRole')
  if (!role) return <Navigate to="/universities" replace />
  return <>{children}</>
}
```

- [x] **Step 3: 라우트 3개 추가**

`<Route path="/find-password" ...>` 아래에 추가:
```tsx
{/* 어드민 페이지 */}
<Route path="/admin/super"        element={<ProtectedAdmin><SuperAdminPage /></ProtectedAdmin>} />
<Route path="/admin/school/:id"   element={<ProtectedAdmin><SchoolAdminPage /></ProtectedAdmin>} />
<Route path="/admin/dept/:id"     element={<ProtectedAdmin><DeptAdminPage /></ProtectedAdmin>} />
```

- [x] **Step 4: 브라우저에서 라우트 확인**

개발 서버(`cd frontend && npm run dev`)를 실행 후 `/admin/super` 직접 접속.
- 로그인 안 된 상태: `/universities`로 리다이렉트됨 ✓
- 로그인 + `adminRole` 있는 상태: 플레이스홀더 페이지 표시됨 ✓

---

## Task 6: 페이지 통합 — selection 스코프

**Files:**
- Modify: `frontend/src/pages/UniversityListPage.tsx`

- [x] **Step 1: import 추가**

```tsx
import AdminBanner from '../components/common/AdminBanner'
```

- [x] **Step 2: hero 섹션 바로 아래에 배너 삽입**

`UniversityListPage.tsx`에서 hero `</section>` 바로 뒤:

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="selection" />

      <main className="max-w-6xl mx-auto px-4 py-10">
```

---

## Task 7: 페이지 통합 — school 스코프 (7개 페이지)

**Files:**
- Modify: `frontend/src/pages/UniversityShowPage.tsx`
- Modify: `frontend/src/pages/SchoolDepartmentsPage.tsx`
- Modify: `frontend/src/pages/SchoolInfoPage.tsx`
- Modify: `frontend/src/pages/FacultyPage.tsx`
- Modify: `frontend/src/pages/SchoolNoticePage.tsx`
- Modify: `frontend/src/pages/SchoolBoardPage.tsx`
- Modify: `frontend/src/pages/SchoolSchedulePage.tsx`

각 페이지에 동일한 패턴을 적용한다. `useDept()`는 이미 임포트되어 있으므로 `selectedUniversityId`만 구조분해로 꺼내면 된다.

- [x] **Step 1: UniversityShowPage.tsx 수정**

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

`useDept()` 구조분해에 `selectedUniversityId` 추가 (이미 있으면 스킵):
```tsx
const { setUniversityInfo, selectedUniversityId } = useDept()
```

hero `</section>` 바로 뒤:

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="school" targetId={selectedUniversityId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
```

- [x] **Step 2: SchoolDepartmentsPage.tsx 수정**

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

`useDept()`에서 `selectedUniversityId` 꺼내기 (이미 있으면 스킵):
```tsx
const { selectedUniversityId, ... } = useDept()
```

hero `</section>` 바로 뒤 (line ~53):

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="school" targetId={selectedUniversityId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-8">
```

- [x] **Step 3: SchoolInfoPage.tsx 수정**

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

`useDept()`에서 `selectedUniversityId` 꺼내기:
```tsx
const { selectedUniversityId, selectedUniversityName } = useDept()
```

hero `</section>` 바로 뒤 (line ~84):

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="school" targetId={selectedUniversityId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
```

- [x] **Step 4: FacultyPage.tsx 수정**

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

`useDept()`에서 `selectedUniversityId` 꺼내기 (이미 있음):
```tsx
const { selectedUniversityId } = useDept()
```

hero `</section>` 바로 뒤 (line ~74):

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="school" targetId={selectedUniversityId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-10">
```

- [x] **Step 5: SchoolNoticePage.tsx 수정**

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

`useDept()`에서 `selectedUniversityId` 꺼내기.

hero `</section>` 바로 뒤 (line ~70):

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="school" targetId={selectedUniversityId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-8">
```

- [x] **Step 6: SchoolBoardPage.tsx 수정**

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

`useDept()`에서 `selectedUniversityId` 꺼내기.

hero `</section>` 바로 뒤 (line ~78):

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="school" targetId={selectedUniversityId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-8">
```

- [x] **Step 7: SchoolSchedulePage.tsx 수정**

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

`useDept()`에서 `selectedUniversityId` 꺼내기.

hero `</section>` 바로 뒤:

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="school" targetId={selectedUniversityId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-8">
```

---

## Task 8: 페이지 통합 — dept 스코프 (5개 페이지)

**Files:**
- Modify: `frontend/src/pages/MainPage.tsx`
- Modify: `frontend/src/pages/BoardPage.tsx`
- Modify: `frontend/src/pages/NoticePage.tsx`
- Modify: `frontend/src/pages/SchedulePage.tsx`
- Modify: `frontend/src/pages/DepartmentPage.tsx`

각 페이지에서 `selectedDeptId`는 `useDept()`로 이미 제공됨.

- [x] **Step 1: MainPage.tsx 수정**

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

hero `</section>` 바로 뒤:

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-10">
```

- [x] **Step 2: BoardPage.tsx 수정**

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

hero `</section>` 바로 뒤:

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-8">
```

- [x] **Step 3: NoticePage.tsx 수정**

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

hero `</section>` 바로 뒤:

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-8">
```

- [x] **Step 4: SchedulePage.tsx 수정**

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

hero `</section>` 바로 뒤:

변경 전:
```tsx
      </section>

      <main className="max-w-6xl mx-auto px-4 py-8">
```

변경 후:
```tsx
      </section>

      <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />

      <main className="max-w-6xl mx-auto px-4 py-8">
```

- [x] **Step 5: DepartmentPage.tsx 수정**

DepartmentPage는 별도의 hero `<section>` 없이 `<DepartmentHero>` 컴포넌트를 사용함.
`<RoleActionBar>` 바로 위에 `AdminBanner`를 삽입한다.

import 추가:
```tsx
import AdminBanner from '../components/common/AdminBanner'
```

변경 전:
```tsx
        <DepartmentHero
          dept={dept}
          extra={extra}
          universityName={selectedUniversityName}
          schoolName={selectedSchoolName}
        />
        <RoleActionBar role={role} scope="department" />
```

변경 후:
```tsx
        <DepartmentHero
          dept={dept}
          extra={extra}
          universityName={selectedUniversityName}
          schoolName={selectedSchoolName}
        />
        <AdminBanner scope="dept" targetId={selectedDeptId ?? undefined} />
        <RoleActionBar role={role} scope="department" />
```

---

## Task 9: 전체 테스트 + 수동 검증

- [x] **Step 1: 전체 테스트 실행**

```bash
cd frontend && npx vitest run
```
Expected: 기존 테스트 + 신규 19개 모두 PASS

- [x] **Step 2: 수동 시나리오 확인**

개발 서버 실행:
```bash
cd frontend && npm run dev
```

| 시나리오 | 기대 결과 |
|---------|----------|
| 비로그인 → `/universities` | 배너 없음 |
| `adminRole=DEPT_ADMIN` → `/universities` | 배너 없음 |
| `adminRole=DEPT_ADMIN` → `/dept/home` | 배너 표시, "학과 관리자" 배지 |
| 배너 버튼 클릭 → `/admin/dept/:id` | 플레이스홀더 페이지 이동 |
| `adminRole=SCHOOL_ADMIN` → `/universities/:id` | 배너 표시, "학교 관리자" 배지 |
| `adminRole=SCHOOL_ADMIN` → `/universities` | 배너 없음 |
| `adminRole=SUPER_ADMIN` → `/universities` | 배너 표시, "최고 관리자" 배지 |
| `adminRole=SUPER_ADMIN` → `/dept/home` | 배너 표시, "최고 관리자" 배지 |
| `/admin/super` 직접 접속 (비로그인) | `/universities` 리다이렉트 |

수동으로 `adminRole` 세팅 방법 (브라우저 콘솔):
```js
sessionStorage.setItem('isLoggedIn', 'true')
sessionStorage.setItem('adminRole', 'SUPER_ADMIN')
window.dispatchEvent(new Event('loginChanged'))
```
