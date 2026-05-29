# Admin Dashboard Design Spec
**Date:** 2026-05-22  
**Scope:** Super Admin Dashboard + School Admin Dashboard with strict RBAC

---

## 1. Overview

두 개의 완전히 분리된 관리자 대시보드를 구현한다. 각 대시보드는 URL, Route Guard, 백엔드 API 컨트롤러가 모두 분리되어 역할 외 접근이 불가능하다.

| 대시보드 | URL | 접근 가능 역할 |
|---------|-----|--------------|
| Super Admin | `/admin/super` | `SUPER_ADMIN` 만 |
| School Admin | `/admin/school/:id` | `SCHOOL_ADMIN` 만 |

`SUPER_ADMIN`이 `/admin/school/:id` 접근 시 → `/universities` 리다이렉트  
`SCHOOL_ADMIN`이 `/admin/super` 접근 시 → `/universities` 리다이렉트

---

## 2. Database Changes

### 신규 테이블: `PAGE_VISITS`

```sql
CREATE TABLE PAGE_VISITS (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    scope_type VARCHAR(20)  NOT NULL,  -- 'univ' | 'school' | 'dept' | 'faculty'
    scope_id   BIGINT       NOT NULL,
    visited_at TIMESTAMP    NOT NULL,
    username   VARCHAR(100)            -- 비로그인 시 NULL
);
```

Spring `HandlerInterceptor` (`VisitInterceptor`)가 아래 패턴 요청마다 자동 기록.  
scope_id는 쿼리 파라미터에서 추출한다:

| URL 패턴 | scope_type | scope_id 출처 |
|---------|-----------|--------------|
| `GET /api/posts?deptId=X` | `dept` | `deptId` 파라미터 |
| `GET /api/notices?deptId=X` | `dept` | `deptId` 파라미터 |
| `GET /api/univ/posts?univId=X` | `univ` | `univId` 파라미터 |
| `GET /api/faculty/posts?facultyId=X` | `faculty` | `facultyId` 파라미터 |

파라미터 누락 시 기록 생략 (에러 발생시키지 않음).

### 기존 테이블 변경 없음

`APP_USERS.university_id` 컬럼 이미 존재 → `SCHOOL_ADMIN` seed 계정에 값 세팅만 추가 (`AdminUserInitializer` 수정).

---

## 3. Backend Architecture

### 인증 방식

모든 admin API 요청 헤더에 `X-Username` 포함. 컨트롤러 진입 시 DB 조회 후 역할 검증. 불일치 시 `403 Forbidden`.

```
요청 → Controller → userRepository.findByUsername(X-Username) → adminRole 검증 → 처리
```

### 신규 파일

```
demo/src/main/java/com/example/demo/
  entity/
    PageVisit.java                  -- PAGE_VISITS 엔티티
  repository/
    PageVisitRepository.java        -- 방문자 쿼리
  interceptor/
    VisitInterceptor.java           -- 방문 자동 기록
  service/
    AdminService.java               -- 공통 admin 비즈니스 로직
  controller/
    SuperAdminController.java       -- /api/admin/super/**
    SchoolAdminController.java      -- /api/admin/school/**
```

### SuperAdminController — `/api/admin/super/**`

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/super/stats` | 총 유저 수, 신규 가입(7일/30일), 총 학교 수 |
| GET | `/api/admin/super/schools` | 등록 대학 목록 |
| GET | `/api/admin/super/visitors` | 전체 일별 방문자 추이 (30일) |
| GET | `/api/admin/super/infra` | 서버 메모리, 업타임, 스레드 수 (JVM 기반) |
| GET | `/api/admin/super/users` | 전체 관리자 계정 목록 |
| PUT | `/api/admin/super/users/{id}/role` | adminRole 변경 (body: `{"role": "..."}`) |
| PUT | `/api/admin/super/users/{id}/approve` | 승인/거절 (body: `{"approved": true/false}`) |

### SchoolAdminController — `/api/admin/school/**`

요청 헤더 `X-Username` → DB에서 `user.universityId`(String) 조회 → `Long.parseLong(universityId)`로 변환하여 학교 범위 결정.  
학교 게시글 조회 시: `Post.scopeType = 'univ'` AND `Post.scopeId = Long.parseLong(user.universityId)` 조건 사용.

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/school/stats` | 해당 학교 게시글 수, 공지 수, 오늘 방문자 |
| GET | `/api/admin/school/visitors` | 해당 학교 일별 방문자 추이 (30일) |
| GET | `/api/admin/school/posts` | 해당 학교 게시글 목록 (페이지네이션) |
| DELETE | `/api/admin/school/posts/{id}` | 게시글 삭제 |
| GET | `/api/admin/school/users` | 해당 학교 소속 관리자 목록 |
| PUT | `/api/admin/school/users/{id}/role` | DEPT_ADMIN 역할 부여/박탈 |
| PUT | `/api/admin/school/users/{id}/approve` | 승인/거절 |

---

## 4. Frontend Architecture

### Route Guards (`App.tsx` 수정)

```tsx
// 기존 ProtectedAdmin 제거, 아래로 교체
function ProtectedSuperAdmin({ children }) {
  const role = sessionStorage.getItem('adminRole')
  if (role !== 'SUPER_ADMIN') return <Navigate to="/universities" replace />
  return <>{children}</>
}

function ProtectedSchoolAdmin({ children }) {
  const role = sessionStorage.getItem('adminRole')
  if (role !== 'SCHOOL_ADMIN') return <Navigate to="/universities" replace />
  return <>{children}</>
}
```

### 신규/수정 파일

```
frontend/src/
  api/
    adminSuper.ts          -- SuperAdmin API 호출 함수 (X-Username 헤더 자동 첨부)
    adminSchool.ts         -- SchoolAdmin API 호출 함수
  pages/admin/
    SuperAdminPage.tsx     -- 완전 구현 (스텁 교체)
    SchoolAdminPage.tsx    -- 완전 구현 (스텁 교체)
  App.tsx                  -- Route Guard 교체
```

### Super Admin 대시보드 레이아웃

```
┌──────────────────────────────────────────────┐
│  헤더: 최고관리자 대시보드 (검정 배경)          │
├─────────┬─────────┬─────────┬────────────────┤
│ 총 유저 │신규가입 │ 학교 수 │ 총 방문자       │ ← 통계 카드
├─────────┴─────────┴─────────┴────────────────┤
│  방문자 추이 Line Chart (30일)                 │
├─────────────────────┬────────────────────────┤
│  등록 학교 목록      │  서버 인프라 현황       │
├─────────────────────┴────────────────────────┤
│  관리자 계정 관리 테이블 (역할변경/승인/박탈)   │
└──────────────────────────────────────────────┘
```

### School Admin 대시보드 레이아웃

```
┌──────────────────────────────────────────────┐
│  헤더: 학교 관리자 대시보드 (검정 배경)         │
├────────────┬────────────┬────────────────────┤
│  총 게시글 │  총 공지   │  오늘 방문자         │ ← 통계 카드
├────────────┴────────────┴────────────────────┤
│  방문자 추이 Line Chart + Doughnut Chart       │
├──────────────────────────────────────────────┤
│  게시글 관리 테이블 (보기/삭제)                │
├──────────────────────────────────────────────┤
│  학과 관리자 계정 관리 (역할 부여/박탈/승인)    │
└──────────────────────────────────────────────┘
```

### 차트 라이브러리

- `chart.js` + `react-chartjs-2` 설치
- Line Chart: 30일 방문자 추이, 블랙 라인 + 회색 fill
- Bar Chart: 월별 신규 유저 (Super Admin)
- Doughnut Chart: 게시글/공지 비율 (School Admin)

### 디자인 원칙

기존 블랙/화이트 미니멀 스타일 유지:
- 헤더: 검정 배경 + 흰 텍스트
- 통계 카드: 흰 배경 + 2px 검정 테두리 + Font Awesome 아이콘
- 차트: 검정/회색 계열 팔레트
- 테이블: 짝수 행 `bg-gray-50`, hover `bg-gray-100`
- 버튼: `border-2 border-black` 기존 스타일 통일

---

## 5. Error Handling

- 백엔드 권한 검증 실패 → `403` 반환 → 프론트 각 admin API 함수에서 `res.status === 403` 체크 후 `window.location.href = '/universities'` 리다이렉트 (프로젝트가 native fetch 사용)
- `PAGE_VISITS` 기록 실패는 사용자 요청을 막지 않음 (interceptor에서 try-catch 처리)

---

## 6. Seed Data Updates

`AdminUserInitializer.java` 수정:
- `schooladmin` 계정에 `universityId = "1"` 세팅 (첫 번째 대학 연결)
- `deptadmin` 계정에 `universityId = "1"`, `department` 세팅

---

## 7. Out of Scope

- Spring Security / JWT 도입 (기존 커스텀 인증 유지)
- 이메일 알림
- 실시간 WebSocket 모니터링
- DeptAdminPage 구현 (기존 스텁 유지)
