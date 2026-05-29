# School Admin v2 + Routing Bug Fix Design Spec
**Date:** 2026-05-22  
**Scope:** Routing bug fix, user status system, enhanced School Admin dashboard with tabs, admin activity log, pending approval queue, monthly stats

---

## 1. Critical Bug Fix — Routing

**Root cause:** `App.tsx:127` wraps `/admin/school/:id` with `ProtectedSchoolAdmin`, which only passes `SCHOOL_ADMIN`. A `SUPER_ADMIN` clicking "관리자 페이지" on a school page is redirected to `/universities`.

**Fix:**

### Frontend (`App.tsx`)
```tsx
function ProtectedSchoolAdmin({ children }) {
  const role = sessionStorage.getItem('adminRole')
  if (role !== 'SUPER_ADMIN' && role !== 'SCHOOL_ADMIN')
    return <Navigate to="/universities" replace />
  return <>{children}</>
}
```

### Frontend (`SchoolAdminPage.tsx`)
- Read `id` from `useParams()`
- When `adminRole === 'SUPER_ADMIN'`, pass `univId` as query param to all API calls
- When `adminRole === 'SCHOOL_ADMIN'`, omit `univId` (backend derives from DB)
- Show "감독 모드" badge in header when SUPER_ADMIN

### Backend (`SchoolAdminController.java`)
Replace `verifySchoolAndGetUnivId(username)` with:
```java
private Long resolveUnivId(String username, Long univIdParam) {
    User user = findAndVerifyRole(username); // SUPER_ADMIN or SCHOOL_ADMIN
    if ("SUPER_ADMIN".equals(user.getAdminRole())) {
        if (univIdParam == null) throw 400 BAD_REQUEST;
        return univIdParam;
    }
    // SCHOOL_ADMIN: derive from DB
    if (user.getUniversityId() == null) throw 403 FORBIDDEN;
    return Long.parseLong(user.getUniversityId());
}
```
All endpoints accept optional `@RequestParam(required=false) Long univId` and call `resolveUnivId(username, univId)`.

---

## 2. DB Schema Changes

### 2.1 `APP_USERS` — Replace `approved` with `status`

**Remove:** `approved BOOLEAN`  
**Add:** `status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'`

| Value | Meaning |
|-------|---------|
| `ACTIVE` | Normal active account |
| `PENDING_APPROVAL` | Admin-type account awaiting approval |
| `SUSPENDED` | Suspended — login blocked |
| `DELETED` | Soft-deleted — login blocked, data preserved |

**Migration logic** (runs once on startup via `StatusMigrationRunner`):
```sql
-- Users where status is null: derive from approved column
-- approved=true  → ACTIVE
-- approved=false → PENDING_APPROVAL
-- General users (student/professor) who are approved → ACTIVE
```
Implemented as a Spring `CommandLineRunner` that iterates users with `status IS NULL`.

**Login check update (`AuthService`):**
- `ACTIVE` → login success
- `PENDING_APPROVAL` → "관리자 승인 후 이용 가능합니다."
- `SUSPENDED` → "계정이 정지되었습니다."
- `DELETED` → "존재하지 않는 계정입니다." (treat same as not found)

### 2.2 New Table: `ADMIN_LOGS`

```
id             BIGINT PK AUTO_INCREMENT
actor_username VARCHAR(100) NOT NULL   -- who acted
action_type    VARCHAR(50)  NOT NULL   -- see values below
target_username VARCHAR(100)           -- who was affected (nullable)
detail         VARCHAR(500)            -- human-readable description
university_id  BIGINT                  -- school scope for filtering
created_at     TIMESTAMP NOT NULL
```

`action_type` values: `APPROVE`, `REJECT`, `SUSPEND`, `UNSUSPEND`, `DELETE`, `ROLE_GRANT`, `ROLE_REVOKE`

Auto-created by Hibernate ddl-auto. All admin mutations in `AdminService` call `logAction(...)` before returning.

---

## 3. Backend Architecture

### 3.1 New Files

```
entity/AdminLog.java
repository/AdminLogRepository.java
```

### 3.2 Modified Files

**`entity/User.java`**
- Remove `approved` boolean field + getter/setter
- Add `status` String field (default `"ACTIVE"`) + getter/setter

**`service/AuthService.java`**
- `login()`: check `user.getStatus()` instead of `user.isApproved()`
- `signup()`: set `status = "ACTIVE"` for non-admin; `status = "PENDING_APPROVAL"` for admin
- Remove all references to `approved`

**`util/AdminUserInitializer.java`**
- Replace `user.setApproved(true)` with `user.setStatus("ACTIVE")`

**`util/StatusMigrationRunner.java`** (new `@Component @Order(3)`)
- On startup: find all users where `status` is null, derive from `approved`, save

**`service/AdminService.java`** — new methods:
```
getSchoolAllUsers(Long univId, int page)     → paginated all users in school
getSchoolPendingUsers(Long univId)           → PENDING_APPROVAL users
updateUserStatus(Long userId, String status, String actorUsername, Long univId)
getAdminLogs(Long univId)                   → last 50 logs
getSchoolMonthlyStats(Long univId)          → 6-month: signups, posts, visits per month
getSchoolAggregatedStats(Long univId)       → visitor stats summing univ+dept+faculty scopes
```

`getSchoolAggregatedStats`: Sums `PAGE_VISITS` where:
- `(scopeType='univ' AND scopeId=univId)`
- `(scopeType='dept' AND scopeId IN <dept IDs for this univ>)`
- `(scopeType='faculty' AND scopeId IN <faculty IDs for this univ>)`

Requires JPQL query with IN clause over department/faculty IDs.

**`controller/SchoolAdminController.java`** — new/updated endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/school/stats` | Updated: aggregated visitor count |
| GET | `/api/admin/school/all-users` | All school users (paginated, `?page=0&univId=X`) |
| GET | `/api/admin/school/pending-users` | PENDING_APPROVAL queue |
| PUT | `/api/admin/school/users/{id}/status` | Change status (body: `{"status":"SUSPENDED"}`) |
| GET | `/api/admin/school/logs` | Admin activity log (last 50) |
| GET | `/api/admin/school/monthly-stats` | 6-month summary stats |

All existing endpoints updated to accept optional `univId` query param for SUPER_ADMIN.

---

## 4. Frontend Architecture

### 4.1 Modified Files

**`frontend/src/App.tsx`**
- `ProtectedSchoolAdmin`: allow `SUPER_ADMIN` or `SCHOOL_ADMIN`

**`frontend/src/api/adminSchool.ts`**
- All fetch functions gain optional `univId?: number` parameter
- When `univId` provided: append `?univId=${univId}` to request URL
- New interfaces: `AllUser`, `PendingUser`, `AdminLog`, `MonthlyStats`
- New functions: `fetchSchoolAllUsers`, `fetchSchoolPendingUsers`, `updateUserStatus`, `fetchAdminLogs`, `fetchSchoolMonthlyStats`

**`frontend/src/pages/admin/SchoolAdminPage.tsx`** — full rewrite with tabs

### 4.2 SchoolAdminPage Tab Layout

```
┌──────────────────────────────────────────────────────────────┐
│ 헤더: 학교 관리자 대시보드  [감독 모드 badge if SUPER_ADMIN]  │
├──────────────────────────────────────────────────────────────┤
│ [ 개요 | 게시글 관리 | 전체 사용자 | 가입 승인 | 관리자 계정 | 활동 로그 ] │
├──────────────────────────────────────────────────────────────┤
│  (tab content)                                               │
└──────────────────────────────────────────────────────────────┘
```

**Tab: 개요 (Overview)**
- 3 stat cards: 총 게시글, 총 공지, 오늘 방문자 (aggregated)
- Line chart: 30-day visitor trend (aggregated all scopes)
- Doughnut chart: posts vs notices ratio
- Bar chart: 6-month monthly stats (signups, posts, visitors per month)

**Tab: 게시글 관리 (Post Management)**
- Existing paginated post table with delete button

**Tab: 전체 사용자 (All Users)**
- Table: name, username, memberType, status badge, action buttons
- Status badge colors: ACTIVE(green), SUSPENDED(orange), DELETED(red)
- Buttons: 정지 (→SUSPENDED) / 복구 (→ACTIVE) / 삭제 (→DELETED, with confirm)
- Filter dropdown: 전체 / 학생 / 교수 / 정지됨

**Tab: 가입 승인 (Pending Approval)**
- Empty state: "대기 중인 가입 요청이 없습니다."
- Table: name, username, memberType, department, createdDate, 승인/거절 buttons
- Approve → status: `ACTIVE`, Reject → status: `DELETED`

**Tab: 관리자 계정 (Admin Accounts)**
- Existing DEPT_ADMIN role grant/revoke table

**Tab: 활동 로그 (Activity Log)**
- Table: action badge, actor, target, detail, time (relative: "3분 전")
- action badges: APPROVE(green), REJECT(red), SUSPEND(orange), DELETE(red), ROLE_GRANT(blue), ROLE_REVOKE(gray)

### 4.3 Design Principles
- Tabs: active tab has `border-b-2 border-black`, inactive `text-gray-400 hover:text-black`
- Status badges: colored border + colored text, consistent size
- All action buttons use existing `border-2 border-black` / destructive `border-red-300 text-red-500` style
- Approval queue shows count badge on tab label when count > 0: `가입 승인 (3)`

---

## 5. Error Handling

- Backend 403 → frontend redirects to `/universities` (existing behavior)
- `updateUserStatus` with `DELETED` is irreversible — frontend shows `window.confirm()` 
- Status migration failure on startup is logged but does not block startup
- `AdminLog` write failure does not block the mutation (try-catch in `logAction`)

---

## 6. Out of Scope

- Email notifications for approval/rejection
- Real-time log streaming (WebSocket)
- Bulk approve/reject in pending queue (single actions only)
- Hard delete (permanent data removal)
- School-wide notice banners (separate feature)
