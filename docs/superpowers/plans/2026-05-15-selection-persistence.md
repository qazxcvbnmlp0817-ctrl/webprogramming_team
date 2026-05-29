# Selection Persistence & Sequential Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 앱 시작 시 저장된 대학교 ID를 확인해 학과 선택 그리드로 자동 이동하고, `/dept/*` 라우트에 접근 가드를 추가해 순차 흐름을 강제한다.

**Architecture:** `useInitialRedirect` 훅에 시작 리다이렉트 결정 로직을 집중시킨다. `ProtectedMain`은 이 훅을 호출하고, `ProtectedDept`는 `/dept/*` 라우트를 보호한다. `DeptContext`와 localStorage 저장 로직은 변경하지 않는다.

**Tech Stack:** React 19, React Router v7, Vitest, @testing-library/react, TypeScript

---

## 변경 파일 목록

| 파일 | 작업 |
|------|------|
| `frontend/src/hooks/useInitialRedirect.ts` | **생성** — 시작 리다이렉트 결정 로직 |
| `frontend/src/hooks/useInitialRedirect.test.ts` | **생성** — 훅 단위 테스트 |
| `frontend/src/App.tsx` | **수정** — ProtectedMain 교체, ProtectedDept 추가 |

---

## Task 1: `useInitialRedirect` 훅 테스트 작성

**Files:**
- Create: `frontend/src/hooks/useInitialRedirect.test.ts`

- [x] **Step 1: 테스트 파일 생성**

`frontend/src/hooks/useInitialRedirect.test.ts`를 아래 내용으로 생성한다:

```ts
import { renderHook } from '@testing-library/react'
import { vi, describe, test, expect, beforeEach } from 'vitest'
import { useInitialRedirect } from './useInitialRedirect'

vi.mock('../context/DeptContext', () => ({ useDept: vi.fn() }))

import { useDept } from '../context/DeptContext'
const mockUseDept = vi.mocked(useDept)

describe('useInitialRedirect', () => {
  beforeEach(() => { vi.clearAllMocks() })

  test('대학교도 학과도 없으면 /universities 반환', () => {
    mockUseDept.mockReturnValue({
      selectedDeptName: null,
      selectedUniversityId: null,
    } as any)
    const { result } = renderHook(() => useInitialRedirect())
    expect(result.current).toBe('/universities')
  })

  test('대학교만 있고 학과가 없으면 /school/departments 반환', () => {
    mockUseDept.mockReturnValue({
      selectedDeptName: null,
      selectedUniversityId: 1,
    } as any)
    const { result } = renderHook(() => useInitialRedirect())
    expect(result.current).toBe('/school/departments')
  })

  test('학과까지 선택된 경우 null 반환 (리다이렉트 없음)', () => {
    mockUseDept.mockReturnValue({
      selectedDeptName: '컴퓨터공학과',
      selectedUniversityId: 1,
    } as any)
    const { result } = renderHook(() => useInitialRedirect())
    expect(result.current).toBeNull()
  })
})
```

- [x] **Step 2: 테스트 실행 — FAIL 확인**

`frontend` 디렉터리에서 실행:
```
npx vitest run src/hooks/useInitialRedirect.test.ts
```

예상 결과: `Cannot find module './useInitialRedirect'` 오류로 FAIL

---

## Task 2: `useInitialRedirect` 훅 구현

**Files:**
- Create: `frontend/src/hooks/useInitialRedirect.ts`

- [x] **Step 1: 훅 파일 생성**

`frontend/src/hooks/useInitialRedirect.ts`를 아래 내용으로 생성한다:

```ts
import { useDept } from '../context/DeptContext'

export function useInitialRedirect(): string | null {
  const { selectedDeptName, selectedUniversityId } = useDept()

  // [AUTH_HOOK] 로그인 기반 리다이렉트 진입점
  // 인증 시스템 추가 시 이 아래에 주입:
  // const user = useAuth()
  // if (user?.deptId) return `/dept-redirect/${user.deptId}`

  if (selectedDeptName) return null
  if (selectedUniversityId) return '/school/departments'
  return '/universities'
}
```

- [x] **Step 2: 테스트 실행 — PASS 확인**

```
npx vitest run src/hooks/useInitialRedirect.test.ts
```

예상 결과:
```
✓ 대학교도 학과도 없으면 /universities 반환
✓ 대학교만 있고 학과가 없으면 /school/departments 반환
✓ 학과까지 선택된 경우 null 반환 (리다이렉트 없음)

Test Files  1 passed
Tests       3 passed
```

- [x] **Step 3: 커밋**

```bash
git add frontend/src/hooks/useInitialRedirect.ts frontend/src/hooks/useInitialRedirect.test.ts
git commit -m "feat: add useInitialRedirect hook with auth injection point"
```

---

## Task 3: `App.tsx` — `ProtectedMain` 교체 및 `ProtectedDept` 추가

**Files:**
- Modify: `frontend/src/App.tsx`

- [x] **Step 1: `ProtectedMain` 수정 및 `ProtectedDept` 추가**

`frontend/src/App.tsx`에서 아래 두 가지를 변경한다.

**① import에 `useInitialRedirect` 추가** (파일 상단):

```tsx
import { useInitialRedirect } from './hooks/useInitialRedirect'
```

**② `ProtectedMain` 함수 교체** (기존 코드 → 새 코드):

기존:
```tsx
function ProtectedMain() {
  const { selectedDeptName } = useDept()
  if (!selectedDeptName) return <Navigate to="/universities" replace />
  return <MainPage />
}
```

교체 후:
```tsx
function ProtectedMain() {
  const destination = useInitialRedirect()
  if (destination) return <Navigate to={destination} replace />
  return <MainPage />
}
```

**③ `ProtectedSchool` 아래에 `ProtectedDept` 추가**:

```tsx
function ProtectedDept({ children }: { children: ReactNode }) {
  const { selectedDeptId } = useDept()
  if (!selectedDeptId) return <Navigate to="/universities" replace />
  return <>{children}</>
}
```

**④ `/dept/*` 라우트 4개에 `ProtectedDept` 적용** (Routes 내부):

기존:
```tsx
<Route path="/dept/notice"     element={<NoticePage />} />
<Route path="/dept/board"      element={<BoardPage />} />
<Route path="/dept/schedule"   element={<SchedulePage />} />
<Route path="/dept/department" element={<DepartmentPage />} />
```

교체 후:
```tsx
<Route path="/dept/notice"     element={<ProtectedDept><NoticePage /></ProtectedDept>} />
<Route path="/dept/board"      element={<ProtectedDept><BoardPage /></ProtectedDept>} />
<Route path="/dept/schedule"   element={<ProtectedDept><SchedulePage /></ProtectedDept>} />
<Route path="/dept/department" element={<ProtectedDept><DepartmentPage /></ProtectedDept>} />
```

- [x] **Step 2: 기존 전체 테스트 통과 확인**

```
npx vitest run
```

예상 결과: 모든 테스트 PASS (기존 테스트 회귀 없음)

- [x] **Step 3: 커밋**

```bash
git add frontend/src/App.tsx
git commit -m "feat: redirect to dept grid on saved school, guard /dept/* routes"
```

---

## Task 4: 빌드 및 최종 확인

- [x] **Step 1: TypeScript 빌드 오류 없음 확인**

```
cd frontend && npx tsc --noEmit
```

예상 결과: 오류 없이 종료

- [x] **Step 2: 전체 테스트 최종 통과 확인**

```
npx vitest run
```

예상 결과: 모든 테스트 PASS

- [x] **Step 3: 동작 수동 검증 (선택)**

`npx vite` 로 dev server 실행 후:
1. localStorage 비운 상태로 `/` 접속 → `/universities`로 이동하는지 확인
2. 대학교 선택 후 새로고침 → `/school/departments`로 이동하는지 확인
3. 학과 선택 후 새로고침 → `/` (MainPage) 유지되는지 확인
4. localStorage 비운 상태로 `/dept/notice` 직접 접속 → `/universities`로 이동하는지 확인

---

## 완성 후 흐름 요약

```
localStorage 비어있음 → /universities (대학교 선택)
           ↓
대학교 선택 → /school/departments (학과 선택 그리드)   ← ProtectedSchool
           ↓
학과 선택   → / (MainPage)                             ← ProtectedMain + useInitialRedirect
           ↓
탐색        → /dept/*                                  ← ProtectedDept
```

어떤 경로든 필요한 컨텍스트가 없으면 `/universities`로 복귀.
