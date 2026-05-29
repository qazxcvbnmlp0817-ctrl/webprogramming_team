# Admin Navigation Button — Design Spec
Date: 2026-05-21

## Overview

Conditionally render an admin banner with a navigation button on three page scopes.
Visibility is gated by a three-tier admin role stored in `sessionStorage`.

---

## 1. Roles

| Value | Description |
|-------|-------------|
| `SUPER_ADMIN` | Full access — all three scopes |
| `SCHOOL_ADMIN` | School page and dept page |
| `DEPT_ADMIN` | Dept page only |

Non-admin users (`GUEST`, `STUDENT`, `PROFESSOR`) see no banner.

---

## 2. Scope → Access Matrix

| Scope | Page group | Allowed roles |
|-------|-----------|---------------|
| `selection` | `/universities` | `SUPER_ADMIN` |
| `school` | `/universities/:id`, `/school/*` | `SUPER_ADMIN`, `SCHOOL_ADMIN` |
| `dept` | `/dept/*` | `SUPER_ADMIN`, `SCHOOL_ADMIN`, `DEPT_ADMIN` |

---

## 3. Data Layer

### 3-1. Backend contract
Login response (`POST /api/auth/login`) must include:
```json
{ "adminRole": "SUPER_ADMIN" | "SCHOOL_ADMIN" | "DEPT_ADMIN" | null }
```
Non-admin users return `null` or omit the field.

### 3-2. sessionStorage
`LoginPage.tsx` stores the value alongside existing fields:
```ts
sessionStorage.setItem('adminRole', result.adminRole ?? '')
```

### 3-3. New hook — `src/hooks/useAdminRole.ts`
Mirrors `useCurrentRole` pattern. Subscribes to `loginChanged` and `storage` events.

```ts
export type AdminRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'DEPT_ADMIN' | null

export function useAdminRole(): AdminRole
```

Existing `useCurrentRole` and `RoleActionBar` are **not modified**.

---

## 4. AdminBanner Component

**File:** `src/components/common/AdminBanner.tsx`

### Props
```ts
interface AdminBannerProps {
  scope: 'selection' | 'school' | 'dept'
  targetId?: number  // used to build /admin/school/:id or /admin/dept/:id
}
```

### Access control (pure function, co-located)
```ts
const ALLOWED: Record<AdminBannerProps['scope'], AdminRole[]> = {
  selection: ['SUPER_ADMIN'],
  school:    ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  dept:      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DEPT_ADMIN'],
}

function canAccess(role: AdminRole, scope: AdminBannerProps['scope']): boolean {
  return role !== null && ALLOWED[scope].includes(role)
}
```

### Destination URL
```ts
function adminUrl(scope, targetId): string {
  if (scope === 'selection') return '/admin/super'
  if (scope === 'school')    return `/admin/school/${targetId ?? ''}`
  return `/admin/dept/${targetId ?? ''}`
}
```

### Render
- Returns `null` when `canAccess` is false.
- When visible: a full-width banner rendered **below the hero section** of the host page.
- Style: `border border-gray-300 bg-gray-50` — visually distinct from main content without being intrusive.
- Contains: shield icon, role badge (한국어 label), `useNavigate` button to admin destination.

**Role badge labels**
| AdminRole | Badge text |
|-----------|-----------|
| `SUPER_ADMIN` | 최고 관리자 |
| `SCHOOL_ADMIN` | 학교 관리자 |
| `DEPT_ADMIN` | 학과 관리자 |

---

## 5. Admin Placeholder Pages

Three new page files, minimal content. Will be replaced later.

| File | Route |
|------|-------|
| `src/pages/admin/SuperAdminPage.tsx` | `/admin/super` |
| `src/pages/admin/SchoolAdminPage.tsx` | `/admin/school/:id` |
| `src/pages/admin/DeptAdminPage.tsx` | `/admin/dept/:id` |

Each renders: page title + "관리자 페이지 준비 중" placeholder text + back button.

---

## 6. Route Protection

New `ProtectedAdmin` wrapper in `App.tsx`:
- Reads `adminRole` from `sessionStorage`.
- Redirects to `/universities` if empty.

```tsx
function ProtectedAdmin({ children }: { children: ReactNode }) {
  const role = sessionStorage.getItem('adminRole')
  if (!role) return <Navigate to="/universities" replace />
  return <>{children}</>
}
```

---

## 7. Page Integration

`AdminBanner` is inserted **below the hero `<section>`** on each target page.
`targetId` comes from `useDept()` context — no extra data fetching needed.

| Page file | scope | targetId source |
|-----------|-------|-----------------|
| `UniversityListPage.tsx` | `selection` | — |
| `UniversityShowPage.tsx` | `school` | `selectedUniversityId` |
| `SchoolDepartmentsPage.tsx` | `school` | `selectedUniversityId` |
| `SchoolInfoPage.tsx` | `school` | `selectedUniversityId` |
| `FacultyPage.tsx` | `school` | `selectedUniversityId` |
| `SchoolNoticePage.tsx` | `school` | `selectedUniversityId` |
| `SchoolBoardPage.tsx` | `school` | `selectedUniversityId` |
| `SchoolSchedulePage.tsx` | `school` | `selectedUniversityId` |
| `MainPage.tsx` | `dept` | `selectedDeptId` |
| `BoardPage.tsx` | `dept` | `selectedDeptId` |
| `NoticePage.tsx` | `dept` | `selectedDeptId` |
| `SchedulePage.tsx` | `dept` | `selectedDeptId` |
| `DepartmentPage.tsx` | `dept` | `selectedDeptId` |

---

## 8. Files Changed / Created

**New files**
- `src/hooks/useAdminRole.ts`
- `src/components/common/AdminBanner.tsx`
- `src/pages/admin/SuperAdminPage.tsx`
- `src/pages/admin/SchoolAdminPage.tsx`
- `src/pages/admin/DeptAdminPage.tsx`

**Modified files**
- `src/pages/LoginPage.tsx` — store `adminRole` in sessionStorage
- `src/App.tsx` — add 3 admin routes + `ProtectedAdmin` wrapper
- 13 page files — insert `<AdminBanner>` below hero section

---

## 9. Out of Scope

- Actual admin page content (provided later)
- Backend changes to `/api/auth/login` response schema
- Server-side role enforcement (handled by backend API guards)
