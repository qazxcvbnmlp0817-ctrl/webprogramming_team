# Dept/Faculty Admin Page Design Spec
**Date:** 2026-05-22
**Scope:** New admin dashboards for department and faculty scopes, following the SchoolAdminPage tab pattern.

---

## 1. Goals

- Department admins and faculty admins each get a tabbed dashboard mirroring `SchoolAdminPage`.
- Pages double as a viewer for the canonical user-facing `DepartmentPage` / `FacultyPage` (read-only embed).
- Post / notice / user management for the scope.
- Super and school admins can view any scope under their authority; dept/faculty admins only see their own.

## 2. URL Layout

| Route | Page | Allowed Roles |
|---|---|---|
| `/admin/dept/:id` | DeptAdminPage | SUPER_ADMIN, SCHOOL_ADMIN, DEPT_ADMIN |
| `/admin/faculty/:id` | FacultyAdminPage *(new)* | SUPER_ADMIN, SCHOOL_ADMIN, DEPT_ADMIN |

`:id` is the **target** scope id (deptId or facultyId). For DEPT_ADMIN logged in viewing their own dept the route is still `/admin/dept/{their deptId}` — id always present.

## 3. Tabs

```
┌──────────────────────────────────────────────────────────────────────┐
│  학과 관리자 대시보드          [감독 모드 SUPER|SCHOOL when not own]  │
│  컴퓨터공학과 · ID 5                                                  │
│                                          [학과 글쓰기] [공지 작성]    │
├──────────────────────────────────────────────────────────────────────┤
│ [개요 | 학과 페이지 | 게시글 관리 | 공지 관리 | 사용자 | 통계]        │
├──────────────────────────────────────────────────────────────────────┤
│  (tab content)                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 개요 (Overview)
- 3 stat cards: 총 게시글, 총 공지, 오늘 방문자 (dept scope, not aggregated)
- Line chart: 30-day visitor trend (dept scope only — leaf scope, no aggregation needed)
- Doughnut chart: post / notice ratio

### 학과 페이지 (Department Preview)
- Embed the canonical `DepartmentPage` for the target dept.
- DepartmentPage's `AdminBanner` should be suppressed here (avoid double admin nav).
- Read-only — no editing controls inside.

### 게시글 관리
- Paginated table of `scope='dept', scopeId=:id` posts.
- Delete with confirm.

### 공지 관리
- Paginated table of `scope='dept', scopeId=:id` notices.
- Delete with confirm.

### 사용자
- Users in this department.
  - Matching rule: `university_id == dept.universityId AND department == dept.name`
    (we have no `app_users.department_id` column; the existing `department` text column is the join key).
- Status badge + 정지 / 복구 / 삭제 actions (same shape as SchoolAdminPage 전체 사용자 tab).

### 통계
- 6-month bar chart: signups, posts, visitors.

### Header buttons (always visible)
- `[학과 글쓰기]` → navigates to `/dept/board/write` (existing page). Before navigating, ensure DeptContext is set to this dept (use `setSelectedDept(...)`).
- `[공지 작성]` → navigates to `/dept/notice/write`.

For FacultyAdminPage the header buttons read 학부 글쓰기 / 학부 공지 작성 and navigate to `/school/faculty/:facultyId/board/write` etc.

## 4. Backend

### Controllers (new)
- `DeptAdminController` at `/api/admin/dept`
- `FacultyAdminController` at `/api/admin/faculty`

Both follow the SchoolAdminController shape: every endpoint accepts an optional `@RequestParam Long deptId` (or facultyId) and resolves the scope via a helper.

### Scope-resolution helper

```java
// DeptAdminController#resolveDeptId
private Long resolveDeptId(String username, Long deptIdParam) {
    User u = findUserOr403(username);
    String role = u.getAdminRole();
    if ("SUPER_ADMIN".equals(role) || "SCHOOL_ADMIN".equals(role)) {
        if (deptIdParam == null) throw 400;
        // SCHOOL_ADMIN must own the dept (dept.universityId == user.universityId)
        if ("SCHOOL_ADMIN".equals(role)) {
            Department d = deptRepo.findById(deptIdParam).orElseThrow(...404);
            FacultyGroup fg = facultyRepo.findById(d.getFacultyId()).orElseThrow(...);
            CollegeSchool cs = collegeRepo.findById(fg.getSchoolId()).orElseThrow(...);
            if (!cs.getUniversityId().equals(Long.parseLong(u.getUniversityId())))
                throw 403;
        }
        return deptIdParam;
    }
    if ("DEPT_ADMIN".equals(role)) {
        // DEPT_ADMIN owns exactly one dept — derive from existing user fields.
        // Walk: user.universityId → CollegeSchool[] → FacultyGroup[] → Department
        // where Department.name == user.department.
        // DEPT_ADMIN ignores the deptIdParam.
        if (u.getUniversityId() == null || u.getDepartment() == null) throw 403;
        Long univ = Long.parseLong(u.getUniversityId());
        List<Long> schoolIds = collegeSchoolRepository.findByUniversityIdOrderByIdAsc(univ)
            .stream().map(CollegeSchool::getId).toList();
        List<Long> facultyIds = schoolIds.stream()
            .flatMap(sid -> facultyGroupRepository.findBySchoolIdOrderByIdAsc(sid).stream())
            .map(FacultyGroup::getId).toList();
        Department d = facultyIds.stream()
            .flatMap(fid -> departmentRepository.findByFacultyIdOrderByIdAsc(fid).stream())
            .filter(dep -> u.getDepartment().equals(dep.getName()))
            .findFirst().orElseThrow(() -> 403);
        return d.getId();
    }
    throw 403;
}
```

### Schema Changes

**None.** DEPT_ADMIN binding is derived from existing `APP_USERS.DEPARTMENT` (string) + `APP_USERS.UNIVERSITY_ID` columns. This avoids ddl-auto migration risk on Oracle.

### Endpoints

`DeptAdminController`:

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/stats` | — | { totalPosts, totalNotices, todayVisitors } |
| GET | `/visitors` | — | [{date, count}] last 30 days |
| GET | `/posts?page=N` | — | Page of posts |
| DELETE | `/posts/{id}` | — | Soft / hard delete (match SchoolAdmin behavior) |
| GET | `/notices?page=N` | — | Page of notices |
| DELETE | `/notices/{id}` | — | |
| GET | `/users` | — | Users matching this dept |
| PUT | `/users/{id}/status` | `{status}` | ACTIVE/SUSPENDED/DELETED |
| GET | `/monthly-stats` | — | 6-month signup/post/visitor |

All accept optional `?deptId=X` query param (used by SUPER_ADMIN/SCHOOL_ADMIN viewing other depts).

`FacultyAdminController` mirrors the same shape with `facultyId` and `scope='faculty'`.

### AdminService additions

New public methods (paralleling existing school methods):

```java
getDeptStats(Long deptId)
getDeptVisitorTrend(Long deptId)
getDeptPosts(Long deptId, int page)
deleteDeptPost(Long postId, Long deptId, String actor)
getDeptNotices(Long deptId, int page)
deleteDeptNotice(Long noticeId, Long deptId, String actor)
getDeptUsers(Long deptId)                  // joins User.department string == dept.name
updateDeptUserStatus(Long userId, String status, Long deptId, String actor)
getDeptMonthlyStats(Long deptId)
```

Same set with `Faculty` prefix.

User-fetch query needs a department-name join because `APP_USERS.DEPT_ID` is null for pre-existing users:

```java
// DepartmentRepository lookup
Department d = departmentRepository.findById(deptId).orElseThrow();
// UserRepository new query
List<User> findByUniversityIdAndDepartment(String universityId, String departmentName);
// Used as: findByUniversityIdAndDepartment(String.valueOf(d.universityIdOfDept), d.name)
```

Since departments are scoped under faculty → school → university we need to walk back to the university id. Add a small util in service to do that.

### Logging

All mutations call `logAction` with the appropriate `universityId` (resolved from dept→faculty→school→univ chain). Action types reuse the existing set (DELETE, SUSPEND, UNSUSPEND, etc.).

## 5. Frontend

### New files
- `frontend/src/api/adminDept.ts` — mirrors `adminSchool.ts` shape, swaps `univId` for `deptId`.
- `frontend/src/api/adminFaculty.ts` — same shape with `facultyId`.
- `frontend/src/pages/admin/FacultyAdminPage.tsx` — new page.

### Rewritten file
- `frontend/src/pages/admin/DeptAdminPage.tsx` — replaces current placeholder.

### Modified files
- `frontend/src/App.tsx`:
  - Add `ProtectedFacultyAdmin` (same body as `ProtectedSchoolAdmin` extended with DEPT_ADMIN).
  - Add `/admin/faculty/:id` route.
- `frontend/src/components/common/AdminBanner.tsx`:
  - When DEPT_ADMIN clicks selection-scope banner, route to `/admin/dept/${sessionStorage.deptId}` if available (we will start storing `deptId` in sessionStorage after login for DEPT_ADMIN).
- `frontend/src/pages/LoginPage.tsx`:
  - On login success, if response includes `deptId`, persist to `sessionStorage.setItem('deptId', ...)`.
- `frontend/src/components/common/AdminBanner.tsx` — `selection` URL for DEPT_ADMIN now uses `deptId` when present.

### Page state shape (DeptAdminPage)

```tsx
const { id } = useParams()
const adminRole = sessionStorage.getItem('adminRole')
const isPrivileged = adminRole === 'SUPER_ADMIN' || adminRole === 'SCHOOL_ADMIN'
const deptId = isPrivileged ? Number(id) : undefined  // backend derives own deptId for DEPT_ADMIN
```

All API calls pass `deptId` only when privileged.

### Embedded DepartmentPage

Render `<DepartmentPage embedded />` in the 학과 페이지 tab. We add an optional `embedded?: boolean` prop to DepartmentPage that:
- Hides `<Navbar />` and top `<div className="pt-14" />` (DeptAdminPage already has them)
- Hides `<AdminBanner />` (avoid recursion)
- Disables `<InfoReportModal />` trigger (we are the admin — nothing to report)

`embedded` defaults to false so existing usage is unaffected.

## 6. Authentication / Login Flow

`AuthService.login` response gains `deptId` when the user has one. `LoginPage` persists to sessionStorage. Existing keys (`adminRole`, `universityId`, `username`) unchanged.

## 7. Out of Scope

- Editing dept content (intro / professors / curriculum / careers / facilities / FAQ) — placeholder for future spec.
- Dept admin granting roles to other users (only SUPER_ADMIN / SCHOOL_ADMIN do that).
- Faculty-level role grant flow (no DEPT_ADMIN below faculty).
- Audit log tab in dept/faculty pages — keep within school-level for now.
- Comment moderation — posts only.
- Bulk actions.

## 8. Error Handling

- 403 → frontend redirects to `/universities` (existing handle403 helper).
- DEPT_ADMIN without `deptId` in DB → 403 from `resolveDeptId`; frontend bounce keeps them out of all dept admin URLs.
- FacultyAdminPage for DEPT_ADMIN: DEPT_ADMIN is below faculty so they should not access faculty admin. `resolveFacultyId` returns 403 for DEPT_ADMIN (only SUPER/SCHOOL allowed).
- Embedded DepartmentPage failures: surface its native error UI, do not crash the dashboard wrapper.

## 9. Testing notes

- Login as DEPT_ADMIN test account, verify `/admin/dept/{their id}` loads all tabs, `/admin/faculty/X` returns 403.
- Login as SCHOOL_ADMIN, verify they can view any dept/faculty under their university but receive 403 for other universities' depts (cross-school test).
- Verify embedded DepartmentPage in the 학과 페이지 tab does not show its own admin banner.
- Verify 학과 글쓰기 / 공지 작성 buttons route to existing pages with deptId pre-selected via DeptContext.
