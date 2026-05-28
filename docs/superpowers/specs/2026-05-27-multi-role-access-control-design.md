# Multi-role Management & Department-based Access Control Design

**Date:** 2026-05-27
**Scope:** 복수 역할 부여 + 통합 대시보드 접근 + 학과 기반 데이터 격리

---

## 1. 요구사항 요약

| 요구사항 | 구현 방식 |
|---------|---------|
| 단일 계정에 복수 역할 (예: 교수 + 학과 관리자) | 기존 `member_type` + `admin_role` 두 컬럼 조합 활용 |
| School Admin이 SCHOOL_ADMIN·DEPT_ADMIN 역할 부여 가능 | 컨트롤러 제한 조건 1줄 수정 |
| 역할 부여 UI (School Admin 대시보드) | "전체 사용자" 탭에 인라인 역할 드롭다운 추가 |
| 통합 대시보드 (교수+관리자 기능 동시 접근) | AdminBanner 조건 수정 (`memberType` → `adminRole` 기준) |
| 학과 기반 데이터 격리 | 백엔드 이미 구현됨; 프론트 라우트 가드 추가 |

---

## 2. DB 스키마

**변경 없음.** 기존 두 컬럼으로 복수 역할 표현 가능.

```
APP_USERS
├── member_type  VARCHAR  -- "student" | "professor" | "assistant" | "admin"
├── admin_role   VARCHAR  -- "SUPER_ADMIN" | "SCHOOL_ADMIN" | "DEPT_ADMIN" | null
└── department   VARCHAR  -- DEPT_ADMIN의 관리 범위 (auto-scope)
```

**역할 조합 예시:**

| member_type | admin_role | 의미 |
|-------------|-----------|------|
| professor | null | 교수 전용 |
| professor | DEPT_ADMIN | 교수 겸 학과 관리자 |
| assistant | DEPT_ADMIN | 조교 겸 학과 관리자 |
| professor | SCHOOL_ADMIN | 교수 겸 학교 관리자 |
| admin | SCHOOL_ADMIN | 전용 학교 관리자 (기존 방식) |

---

## 3. 백엔드 변경

### 3-1. SchoolAdminController.java — 역할 부여 제한 완화

**파일:** `demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java`

```java
// Before: SCHOOL_ADMIN은 DEPT_ADMIN만 부여 가능
if ("SCHOOL_ADMIN".equals(role) || "SUPER_ADMIN".equals(role)) {
    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
}

// After: SCHOOL_ADMIN은 SCHOOL_ADMIN·DEPT_ADMIN 모두 부여 가능, SUPER_ADMIN만 금지
if ("SUPER_ADMIN".equals(role)) {
    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "SUPER_ADMIN 역할은 부여할 수 없습니다");
}
```

**변경 없는 백엔드 목록:**
- `AdminService.updateUserRole()` — 역할 저장 + ROLE_GRANT/ROLE_REVOKE 로그 이미 처리
- `DeptAdminController.resolveDeptId()` — `user.department` 자동 scope 이미 처리
- `SchoolAdminController.resolveUnivId()` — SCHOOL_ADMIN은 본인 universityId 자동 적용 이미 처리
- 모든 admin 엔드포인트 — `adminRole` 기준 접근 제어 이미 동작 중

---

## 4. 프론트엔드 변경

### 4-1. AdminBanner 수정

**파일:** `frontend/src/components/common/AdminBanner.tsx` (또는 동등 컴포넌트)

```ts
// Before
const showAdminBanner = memberType === 'admin'

// After
const adminRole = sessionStorage.getItem('adminRole')
const showAdminBanner = !!adminRole  // adminRole이 있으면 memberType 무관하게 표시
```

관리자 대시보드 진입 경로:
- `adminRole === 'DEPT_ADMIN'` → `/admin/dept`
- `adminRole === 'SCHOOL_ADMIN'` → `/admin/school`
- `adminRole === 'SUPER_ADMIN'` → `/admin/super`

### 4-2. SchoolAdminPage.tsx — "전체 사용자" 탭 역할 드롭다운 추가

**파일:** `frontend/src/pages/admin/SchoolAdminPage.tsx`

"전체 사용자" 탭의 각 사용자 행에 역할 드롭다운 추가:

```tsx
// 각 사용자 행에 추가
<select
  value={user.adminRole ?? '없음'}
  onChange={(e) => handleRoleChange(user.id, e.target.value)}
>
  <option value="">없음</option>
  <option value="SCHOOL_ADMIN">SCHOOL_ADMIN</option>
  <option value="DEPT_ADMIN">DEPT_ADMIN</option>
</select>

// 핸들러
const handleRoleChange = async (userId: number, role: string) => {
  await updateSchoolUserRole(userId, role || null, univId)
  // 사용자 목록 재조회
  fetchAllUsers()
}
```

### 4-3. SchoolAdminPage.tsx — "관리자 계정" 탭 표시 확장

기존: `adminRole != null`인 사용자만 표시 (이미 구현됨)
변경: 각 행에 `memberType` 뱃지 추가 표시

```tsx
// 각 관리자 계정 행
<span className="badge member-type">{user.memberType}</span>  // 추가
<span className="badge admin-role">{user.adminRole}</span>    // 기존
```

### 4-4. 라우트 가드 (ProtectedAdminRoute)

**파일:** `frontend/src/components/common/ProtectedAdminRoute.tsx` (신규 또는 기존 확장)

```tsx
interface Props {
  requiredRole: 'DEPT_ADMIN' | 'SCHOOL_ADMIN' | 'SUPER_ADMIN'
  children: ReactNode
}

export function ProtectedAdminRoute({ requiredRole, children }: Props) {
  const adminRole = sessionStorage.getItem('adminRole')

  if (!adminRole) return <Navigate to="/" replace />

  const allowed: Record<string, string[]> = {
    DEPT_ADMIN:   ['DEPT_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN'],
    SCHOOL_ADMIN: ['SCHOOL_ADMIN', 'SUPER_ADMIN'],
    SUPER_ADMIN:  ['SUPER_ADMIN'],
  }

  if (!allowed[requiredRole].includes(adminRole)) return <Navigate to="/" replace />

  return <>{children}</>
}
```

App.tsx 라우트에 적용:
```tsx
<Route path="/admin/dept"   element={<ProtectedAdminRoute requiredRole="DEPT_ADMIN"><DeptAdminPage /></ProtectedAdminRoute>} />
<Route path="/admin/school" element={<ProtectedAdminRoute requiredRole="SCHOOL_ADMIN"><SchoolAdminPage /></ProtectedAdminRoute>} />
<Route path="/admin/super"  element={<ProtectedAdminRoute requiredRole="SUPER_ADMIN"><SuperAdminPage /></ProtectedAdminRoute>} />
```

---

## 5. 사용자 흐름

```
School Admin이 교수에게 DEPT_ADMIN 부여
  └─ "전체 사용자" 탭 → 드롭다운에서 DEPT_ADMIN 선택
       └─ PUT /api/admin/school/users/{id}/role 호출
            └─ DB: professor의 admin_role = 'DEPT_ADMIN' 저장

교수 재로그인
  └─ sessionStorage: memberType="professor", adminRole="DEPT_ADMIN"
       └─ 교수 메인 페이지 진입 (캘린더, 공지 등 기존 그대로)
            └─ AdminBanner 표시 (adminRole != null)
                 └─ "관리자 대시보드" 클릭 → /admin/dept
                      └─ ProtectedAdminRoute 통과
                           └─ DeptAdminPage: user.department 기반 학과 데이터 자동 격리
```

---

## 6. 영향 범위

| 파일 | 변경 유형 |
|------|---------|
| `SchoolAdminController.java` | 조건 1줄 수정 |
| `AdminBanner.tsx` | 조건 1줄 수정 |
| `SchoolAdminPage.tsx` | 드롭다운 UI 추가, 뱃지 추가 |
| `ProtectedAdminRoute.tsx` | 신규 컴포넌트 (소규모) |
| `App.tsx` | 라우트 래핑 |

**변경 없는 파일:** DB 스키마, AdminService, DeptAdminController, FacultyAdminController, SuperAdminController, authStorage.ts

---

## 7. 테스트 포인트

- 교수 계정에 DEPT_ADMIN 부여 후 로그인 → AdminBanner 표시 확인
- AdminBanner 클릭 → DeptAdminPage 진입, 본인 학과 데이터만 보이는지 확인
- DeptAdminPage URL 직접 접근 시 adminRole 없는 일반 학생은 `/`로 리다이렉트 확인
- SCHOOL_ADMIN이 다른 사용자에게 SCHOOL_ADMIN 역할 부여 가능 여부 확인
- SCHOOL_ADMIN이 SUPER_ADMIN 역할 부여 시도 → 403 응답 확인
- "관리자 계정" 탭에 professor+DEPT_ADMIN 사용자가 표시되는지 확인
