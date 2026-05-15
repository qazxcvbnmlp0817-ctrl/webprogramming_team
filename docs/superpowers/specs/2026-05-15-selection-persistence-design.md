# Selection Persistence & Sequential Flow — Design Spec

**Date:** 2026-05-15  
**Status:** Approved

---

## 목표

1. 앱 시작 시 저장된 대학교 ID가 있으면 학과 선택 그리드(`/school/departments`)로 자동 이동 — 초기 선택 화면 건너뜀
2. 나중에 로그인 기반 리다이렉트를 주입할 수 있는 명확한 코드 진입점 제공
3. 순차 흐름(`/universities → /school/departments → /`) 강제 — 컨텍스트 없이 하위 페이지 직접 접근 시 `/universities`로 복귀

---

## 현재 상태

- `DeptContext`가 이미 `localStorage`(`deptState` 키)에 전체 상태를 저장 중
  - `selectedUniversityId`, `selectedDeptId`, `selectedDeptName` 등 포함
- `ProtectedMain` (`/` 라우트): `selectedDeptName` 없으면 무조건 `/universities`로 이동
  - 대학교를 이미 선택한 사용자도 다시 목록 화면으로 돌아가는 문제
- `ProtectedSchool` (`/school/*` 라우트): `selectedUniversityId` 없으면 `/universities`로 이동 — 정상 작동 중
- `/dept/*` 라우트 (공지, 게시판, 일정, 학과정보): 보호 없음 — 직접 접근 가능

---

## 변경 대상 파일

```
frontend/src/
├── hooks/
│   └── useInitialRedirect.ts   ← 새 파일
├── App.tsx                     ← ProtectedMain 수정 + ProtectedDept 추가
└── context/DeptContext.tsx     ← 변경 없음
```

---

## 상세 설계

### 1. `useInitialRedirect` 훅 (새 파일)

**경로:** `frontend/src/hooks/useInitialRedirect.ts`

**역할:** 앱 루트(`/`)에서 사용자를 어디로 보낼지 결정. 리다이렉트 목적지 문자열 또는 `null`(현재 페이지 유지) 반환.

**로직 순서:**
```
1. [AUTH_HOOK] 로그인된 사용자 → 사용자별 학과로 이동 (미래 구현)
2. selectedDeptName 있음 → null (MainPage 렌더)
3. selectedUniversityId 있음 → '/school/departments'
4. 없음 → '/universities'
```

**인터페이스:**
```ts
function useInitialRedirect(): string | null
// null = 리다이렉트 불필요, 현재 페이지 그대로 렌더
```

---

### 2. `ProtectedMain` 수정 (App.tsx)

**변경 전:**
```tsx
function ProtectedMain() {
  const { selectedDeptName } = useDept()
  if (!selectedDeptName) return <Navigate to="/universities" replace />
  return <MainPage />
}
```

**변경 후:**
```tsx
function ProtectedMain() {
  const destination = useInitialRedirect()
  if (destination) return <Navigate to={destination} replace />
  return <MainPage />
}
```

---

### 3. `ProtectedDept` 추가 (App.tsx)

`/dept/*` 4개 라우트에 적용. `selectedDeptId` 없으면 `/universities`로 이동.

```tsx
function ProtectedDept({ children }: { children: ReactNode }) {
  const { selectedDeptId } = useDept()
  if (!selectedDeptId) return <Navigate to="/universities" replace />
  return <>{children}</>
}
```

적용 대상:
- `/dept/notice`
- `/dept/board`
- `/dept/schedule`
- `/dept/department`

---

## 순차 흐름 보장 (완성 후)

```
/universities
    ↓ 대학교 선택
/school/departments  ← ProtectedSchool (selectedUniversityId 필요)
    ↓ 학과 선택
/ (MainPage)         ← ProtectedMain via useInitialRedirect
    ↓ 탐색
/dept/*              ← ProtectedDept (selectedDeptId 필요)
```

어떤 경로든 필요한 컨텍스트가 없으면 → `/universities`로 복귀

---

## 미래 Auth 연동 방법

`useInitialRedirect.ts`의 `[AUTH_HOOK]` 주석 위치에 아래와 같이 추가:

```ts
// [AUTH_HOOK] 로그인 기반 리다이렉트 진입점
// const user = useAuth()
// if (user && user.deptId) return `/dept-redirect/${user.deptId}`
```

`App.tsx`나 라우터 구조는 변경 불필요.

---

## 범위 외 (이번 작업에서 제외)

- 실제 인증 시스템 구현
- `/school/*` 라우트 보호 로직 변경 (이미 정상 작동 중)
- `DeptContext` 저장 방식 변경
