# Dept/Faculty Admin Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add tabbed admin dashboards for department and faculty scopes that mirror SchoolAdminPage, plus an embedded preview of the canonical DepartmentPage / FacultyPage. See `docs/superpowers/specs/2026-05-22-dept-faculty-admin-design.md`.

**Architecture:** Two new controllers (`DeptAdminController`, `FacultyAdminController`) with a shared `resolveDeptId` / `resolveFacultyId` pattern modeled after `SchoolAdminController#resolveUnivId`. AdminService gains scope-aware methods. Frontend adds two new API clients and one new page, rewrites `DeptAdminPage`, and updates routing. DepartmentPage gains an `embedded` prop so it can render inside the admin dashboard.

**Tech Stack:** Spring Boot 3 / JPA / Oracle. React 18 + TypeScript + Vite + Tailwind + Chart.js.

---

### Task 1: AdminService dept-scope methods

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/service/AdminService.java`
- Modify: `demo/demo/src/main/java/com/example/demo/repository/UserRepository.java`

- [ ] **Step 1:** In `UserRepository` add the query used by `getDeptUsers`:

```java
List<User> findByUniversityIdAndDepartment(String universityId, String department);
```

- [ ] **Step 2:** In `AdminService` add a "Dept Admin" section with these public methods. Place after the "School Admin" section, before "Shared". Use existing repos (`postRepository`, `noticeRepository`, `pageVisitRepository`, `userRepository`, `departmentRepository`):

```java
// ── Dept Admin ─────────────────────────────────────────────────────────

public Map<String, Object> getDeptStats(Long deptId) {
    long totalPosts   = postRepository.countByScopeTypeAndScopeId("dept", deptId);
    long totalNotices = noticeRepository.countByScopeTypeAndScopeId("dept", deptId);
    LocalDateTime todayStart = LocalDate.now().atStartOfDay();
    long todayVisitors = pageVisitRepository
        .countByScopeTypeAndScopeIdAndVisitedAtAfter("dept", deptId, todayStart);
    Map<String, Object> result = new HashMap<>();
    result.put("totalPosts", totalPosts);
    result.put("totalNotices", totalNotices);
    result.put("todayVisitors", todayVisitors);
    return result;
}

public List<Map<String, Object>> getDeptVisitorTrend(Long deptId) {
    LocalDateTime since = LocalDate.now().minusDays(29).atStartOfDay();
    List<PageVisit> visits = pageVisitRepository
        .findByScopeTypeAndScopeIdAndVisitedAtAfter("dept", deptId, since);
    return aggregateByDay(visits);   // existing helper
}

public Map<String, Object> getDeptPosts(Long deptId, int page) {
    return getSchoolPostsImpl("dept", deptId, page);   // reuse, see Step 3
}

public Map<String, Object> deleteDeptPost(Long postId, Long deptId, String actor) {
    Post p = postRepository.findById(postId)
        .orElseThrow(() -> new RuntimeException("Post not found"));
    if (!"dept".equals(p.getScopeType()) || !deptId.equals(p.getScopeId()))
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "scope mismatch");
    postRepository.deleteById(postId);
    logAction(actor, "DELETE", null, "dept post#" + postId, deptToUnivId(deptId));
    return Map.of("success", true);
}

public Map<String, Object> getDeptNotices(Long deptId, int page) {
    return getSchoolNoticesImpl("dept", deptId, page);  // reuse, see Step 3
}

public Map<String, Object> deleteDeptNotice(Long noticeId, Long deptId, String actor) {
    Notice n = noticeRepository.findById(noticeId)
        .orElseThrow(() -> new RuntimeException("Notice not found"));
    if (!"dept".equals(n.getScopeType()) || !deptId.equals(n.getScopeId()))
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "scope mismatch");
    noticeRepository.deleteById(noticeId);
    logAction(actor, "DELETE", null, "dept notice#" + noticeId, deptToUnivId(deptId));
    return Map.of("success", true);
}

public List<Map<String, Object>> getDeptUsers(Long deptId) {
    Department d = departmentRepository.findById(deptId)
        .orElseThrow(() -> new RuntimeException("Department not found"));
    Long univId = deptToUnivId(deptId);
    if (univId == null) return Collections.emptyList();
    return userRepository.findByUniversityIdAndDepartment(String.valueOf(univId), d.getName())
        .stream().map(this::toUserMap).collect(Collectors.toList());
}

public Map<String, Object> updateDeptUserStatus(Long userId, String status,
                                                  Long deptId, String actor) {
    return updateUserStatus(userId, status, actor, deptToUnivId(deptId));
}

public List<Map<String, Object>> getDeptMonthlyStats(Long deptId) {
    Department d = departmentRepository.findById(deptId)
        .orElseThrow(() -> new RuntimeException("Department not found"));
    Long univ = deptToUnivId(deptId);
    List<Map<String, Object>> result = new ArrayList<>();
    YearMonth now = YearMonth.now();
    for (int i = 5; i >= 0; i--) {
        YearMonth ym = now.minusMonths(i);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end   = ym.atEndOfMonth().atTime(23, 59, 59);
        long signups  = univ != null ? userRepository
            .countByUniversityIdAndCreatedDateBetween(String.valueOf(univ), start, end) : 0;
        long posts    = postRepository.countByScopeTypeAndScopeIdAndCreatedDateBetween("dept", deptId, start, end);
        long visitors = pageVisitRepository.countByScopeTypeAndScopeIdAndVisitedAtBetween("dept", deptId, start, end);
        Map<String, Object> m = new HashMap<>();
        m.put("month", ym.toString());
        m.put("signups", signups);
        m.put("posts", posts);
        m.put("visitors", visitors);
        result.add(m);
    }
    return result;
}

// Helper: walk dept → faculty → school → univ
public Long deptToUnivId(Long deptId) {
    return departmentRepository.findById(deptId)
        .flatMap(d -> facultyGroupRepository.findById(d.getFacultyId()))
        .flatMap(f -> collegeSchoolRepository.findById(f.getSchoolId()))
        .map(CollegeSchool::getUniversityId)
        .orElse(null);
}
```

- [ ] **Step 3:** Refactor existing `getSchoolPosts(univId, page)` and the analogous notice method into scope-agnostic private helpers `getSchoolPostsImpl(scopeType, scopeId, page)` and `getSchoolNoticesImpl(...)`. The existing `getSchoolPosts` becomes a thin wrapper: `return getSchoolPostsImpl("univ", univId, page);`. New dept methods reuse the helper.

- [ ] **Step 4:** Build the project to verify compilation:

```bash
cd demo/demo && ./mvnw.cmd compile -q
```
Expected: BUILD SUCCESS.

- [ ] **Step 5:** Commit.

```bash
git add demo/demo/src/main/java/com/example/demo/service/AdminService.java \
        demo/demo/src/main/java/com/example/demo/repository/UserRepository.java
git commit -m "feat: AdminService dept-scope methods (stats, posts, notices, users, monthly)"
```

---

### Task 2: DeptAdminController

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/controller/DeptAdminController.java`

- [ ] **Step 1:** Create the controller. Use `SchoolAdminController` as the structural reference. Key points:
  - Path prefix `/api/admin/dept`.
  - Inject `AdminService`, `UserRepository`, `DepartmentRepository`, `FacultyGroupRepository`, `CollegeSchoolRepository`.
  - `resolveDeptId(username, deptIdParam)` follows spec section 4. SUPER_ADMIN: requires deptIdParam. SCHOOL_ADMIN: requires deptIdParam AND the dept must belong to the user's university (walk dept→faculty→school). DEPT_ADMIN: derive from user.universityId + user.department via the dept-name walk.
  - `resolveActor(username)` returns the username verbatim (used in logAction).
  - Endpoints exactly as in spec section 4 "Endpoints":

```java
@GetMapping("/stats")          // getDeptStats
@GetMapping("/visitors")       // getDeptVisitorTrend
@GetMapping("/posts")          // getDeptPosts (?page=N)
@DeleteMapping("/posts/{id}")  // deleteDeptPost
@GetMapping("/notices")        // getDeptNotices (?page=N)
@DeleteMapping("/notices/{id}")// deleteDeptNotice
@GetMapping("/users")          // getDeptUsers
@PutMapping("/users/{id}/status") // updateDeptUserStatus
@GetMapping("/monthly-stats")  // getDeptMonthlyStats
```

Each accepts `@RequestParam(required=false) Long deptId` and calls `resolveDeptId(username, deptId)` to get the actual id.

- [ ] **Step 2:** Compile.

```bash
cd demo/demo && ./mvnw.cmd compile -q
```

- [ ] **Step 3:** Commit.

```bash
git add demo/demo/src/main/java/com/example/demo/controller/DeptAdminController.java
git commit -m "feat: DeptAdminController with role-based deptId resolution"
```

---

### Task 3: AdminService faculty-scope methods

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/service/AdminService.java`

- [ ] **Step 1:** Add a faculty section paralleling Dept (`getFacultyStats`, `getFacultyVisitorTrend`, `getFacultyPosts`, `deleteFacultyPost`, `getFacultyNotices`, `deleteFacultyNotice`, `getFacultyUsers`, `updateFacultyUserStatus`, `getFacultyMonthlyStats`). `getFacultyUsers` aggregates users across all depts in the faculty (their `department` matches one of the dept names belonging to the faculty).

Helper:
```java
public Long facultyToUnivId(Long facultyId) {
    return facultyGroupRepository.findById(facultyId)
        .flatMap(f -> collegeSchoolRepository.findById(f.getSchoolId()))
        .map(CollegeSchool::getUniversityId)
        .orElse(null);
}
```

`getFacultyUsers`:
```java
public List<Map<String, Object>> getFacultyUsers(Long facultyId) {
    List<String> deptNames = departmentRepository.findByFacultyIdOrderByIdAsc(facultyId)
        .stream().map(Department::getName).collect(Collectors.toList());
    if (deptNames.isEmpty()) return Collections.emptyList();
    Long univId = facultyToUnivId(facultyId);
    if (univId == null) return Collections.emptyList();
    String univStr = String.valueOf(univId);
    return deptNames.stream()
        .flatMap(n -> userRepository.findByUniversityIdAndDepartment(univStr, n).stream())
        .map(this::toUserMap)
        .collect(Collectors.toList());
}
```

- [ ] **Step 2:** Compile.

```bash
cd demo/demo && ./mvnw.cmd compile -q
```

- [ ] **Step 3:** Commit.

```bash
git add demo/demo/src/main/java/com/example/demo/service/AdminService.java
git commit -m "feat: AdminService faculty-scope methods"
```

---

### Task 4: FacultyAdminController

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/controller/FacultyAdminController.java`

- [ ] **Step 1:** Mirror `DeptAdminController` with path `/api/admin/faculty`. `resolveFacultyId(username, facultyIdParam)`:
  - SUPER_ADMIN: deptIdParam → facultyIdParam, no university check.
  - SCHOOL_ADMIN: required, walk faculty→school and verify school's universityId matches user.
  - DEPT_ADMIN: **403** (DEPT_ADMIN is below faculty).
  - Other: 403.

Endpoints same set as Dept (9 endpoints), each calling the corresponding `getFaculty*` service method.

- [ ] **Step 2:** Compile + commit.

```bash
cd demo/demo && ./mvnw.cmd compile -q
git add demo/demo/src/main/java/com/example/demo/controller/FacultyAdminController.java
git commit -m "feat: FacultyAdminController (no DEPT_ADMIN access)"
```

---

### Task 5: Frontend API clients

**Files:**
- Create: `frontend/src/api/adminDept.ts`
- Create: `frontend/src/api/adminFaculty.ts`

- [ ] **Step 1:** Clone `frontend/src/api/adminSchool.ts` to `adminDept.ts`. Replace every `univId` with `deptId`, change paths from `/api/admin/school/` to `/api/admin/dept/`. Keep `AdminUser`, `AdminLog`, `MonthlyStats`, `VisitorPoint`, `SchoolStats`, `PostItem`, `PostPage` interface shapes — rename `SchoolStats` → `DeptStats`. Remove pending/all-users/admin-log functions (those are not in dept scope; spec section 7).

  Final function list:
  - `fetchDeptStats(deptId?)`
  - `fetchDeptVisitors(deptId?)`
  - `fetchDeptPosts(page, deptId?)`
  - `deleteDeptPost(postId, deptId?)`
  - `fetchDeptNotices(page, deptId?)`
  - `deleteDeptNotice(noticeId, deptId?)`
  - `fetchDeptUsers(deptId?)`
  - `updateDeptUserStatus(userId, status, deptId?)`
  - `fetchDeptMonthlyStats(deptId?)`

- [ ] **Step 2:** Do the same for `adminFaculty.ts` — substitute `facultyId` and `/api/admin/faculty/`.

- [ ] **Step 3:** Run typecheck:

```bash
cd frontend && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 4:** Commit.

```bash
git add frontend/src/api/adminDept.ts frontend/src/api/adminFaculty.ts
git commit -m "feat: add adminDept/adminFaculty API clients"
```

---

### Task 6: DepartmentPage embedded prop

**Files:**
- Modify: `frontend/src/pages/DepartmentPage.tsx`

- [ ] **Step 1:** Add optional prop `embedded?: boolean` (defaults to false). When `embedded`:
  - Drop the outer `<div className="bg-white text-black font-sans min-h-screen">` wrapper (return a fragment).
  - Skip `<Navbar />` and the `<div className="pt-14" />` spacer.
  - Skip `<AdminBanner />`.
  - Disable the `InfoReportModal` open button (still render the modal closed — but pass an empty handler instead of `setReportOpen(true)`).
  - All other sections render normally.

Use a single boolean conditional, do not duplicate the JSX.

- [ ] **Step 2:** Typecheck.

```bash
cd frontend && npx tsc --noEmit
```

- [ ] **Step 3:** Commit.

```bash
git add frontend/src/pages/DepartmentPage.tsx
git commit -m "feat: DepartmentPage embedded prop for admin preview"
```

---

### Task 7: DeptAdminPage rewrite

**Files:**
- Modify: `frontend/src/pages/admin/DeptAdminPage.tsx` (replace placeholder)

- [ ] **Step 1:** Replace the file entirely with a 6-tab dashboard. Use `frontend/src/pages/admin/SchoolAdminPage.tsx` as the structural template. Differences:

  - Page title: "학과 관리자 대시보드"
  - Tabs: `['개요', '학과 페이지', '게시글 관리', '공지 관리', '사용자', '통계']`
  - State derivation:
    ```tsx
    const { id } = useParams<{ id: string }>()
    const adminRole = sessionStorage.getItem('adminRole')
    const isPrivileged = adminRole === 'SUPER_ADMIN' || adminRole === 'SCHOOL_ADMIN'
    const deptId = isPrivileged ? Number(id) : undefined
    ```
  - 감독 모드 badge shows when `isPrivileged`.
  - 헤더에 `[학과 글쓰기]` and `[공지 작성]` buttons → `navigate('/dept/board/write')` / `navigate('/dept/notice/write')`. Before navigating set DeptContext deptId via `useDept().setSelectedDept(...)` using the resolved id (read from `id` param) so the write pages know which dept the post belongs to.
  - Tab 학과 페이지: render `<DepartmentPage embedded />`.
  - Tab 통계: bar chart with monthlyStats (same as SchoolAdminPage 개요 6-month chart).
  - No "활동 로그" tab (out of scope).
  - No "관리자 계정" tab (DEPT_ADMIN can't grant roles).

- [ ] **Step 2:** Build the frontend:

```bash
cd frontend && npm run build
```
Expected: built in N seconds, no errors.

- [ ] **Step 3:** Commit.

```bash
git add frontend/src/pages/admin/DeptAdminPage.tsx \
        demo/demo/src/main/resources/static/index.html \
        demo/demo/src/main/resources/static/assets/
git commit -m "feat: DeptAdminPage full 6-tab dashboard"
```

---

### Task 8: FacultyAdminPage

**Files:**
- Create: `frontend/src/pages/admin/FacultyAdminPage.tsx`

- [ ] **Step 1:** Same structure as DeptAdminPage but for faculty scope. Tabs:
  `['개요', '학부 페이지', '게시글 관리', '공지 관리', '사용자', '통계']`

  학부 페이지 tab: render `<FacultyPage embedded />`. (Faculty page may need the same `embedded` prop — see Step 2.)

- [ ] **Step 2:** Add `embedded` prop to `frontend/src/pages/FacultyPage.tsx` with the same semantics as DepartmentPage's. Open the file, identify Navbar/AdminBanner/Hero structure, gate them on `!embedded`.

- [ ] **Step 3:** Build.

```bash
cd frontend && npm run build
```

- [ ] **Step 4:** Commit.

```bash
git add frontend/src/pages/admin/FacultyAdminPage.tsx \
        frontend/src/pages/FacultyPage.tsx \
        demo/demo/src/main/resources/static/index.html \
        demo/demo/src/main/resources/static/assets/
git commit -m "feat: FacultyAdminPage + FacultyPage embedded prop"
```

---

### Task 9: App.tsx route + AdminBanner + LoginPage

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/common/AdminBanner.tsx`
- Modify: `frontend/src/pages/LoginPage.tsx`

- [ ] **Step 1:** App.tsx — import `FacultyAdminPage`, add new guard, add route:

```tsx
function ProtectedFacultyAdmin({ children }: { children: ReactNode }) {
  const role = sessionStorage.getItem('adminRole')
  if (role !== 'SUPER_ADMIN' && role !== 'SCHOOL_ADMIN') return <Navigate to="/universities" replace />
  return <>{children}</>
}
// route
<Route path="/admin/faculty/:id" element={<ProtectedFacultyAdmin><FacultyAdminPage /></ProtectedFacultyAdmin>} />
```

Note: DEPT_ADMIN is intentionally blocked from `/admin/faculty/:id` (spec section 4).

- [ ] **Step 2:** AdminBanner.tsx — when `scope === 'selection'` and `role === 'DEPT_ADMIN'`, look up `sessionStorage.getItem('deptId')`; if present, navigate to `/admin/dept/${deptId}`. (Currently AdminBanner falls back to `/admin/school/...` for DEPT_ADMIN — switch to dept URL.)

```tsx
if (scope === 'selection') {
  if (role === 'SUPER_ADMIN')  return '/admin/super'
  if (role === 'SCHOOL_ADMIN') {
    const univ = sessionStorage.getItem('universityId')
    return univ ? `/admin/school/${univ}` : '/admin/super'
  }
  // DEPT_ADMIN
  const dept = sessionStorage.getItem('deptId')
  if (dept) return `/admin/dept/${dept}`
  const univ = sessionStorage.getItem('universityId')
  return univ ? `/admin/school/${univ}` : '/universities'
}
```

- [ ] **Step 3:** LoginPage.tsx — on successful login, if response includes `deptId` (numeric) persist to sessionStorage:

```tsx
if (data.deptId != null) sessionStorage.setItem('deptId', String(data.deptId))
```

If `deptId` is not in the login response, persist nothing (DEPT_ADMIN can still navigate to `/admin/dept/{id}` via direct URL — they just won't get the banner shortcut). The backend derives deptId from user.department for the admin pages.

- [ ] **Step 4:** AuthService login response — augment to include `deptId` when user is DEPT_ADMIN by walking `dept→faculty→school` (use the same `deptToUnivId`-style walk to resolve the user's dept id from their department name). When user is not DEPT_ADMIN, leave deptId off.

  Modify: `demo/demo/src/main/java/com/example/demo/service/AuthService.java` — inside `login()` after the existing role/universityId putters, add:

```java
if ("DEPT_ADMIN".equals(user.getAdminRole())
        && user.getUniversityId() != null && user.getDepartment() != null) {
    Long deptId = adminService.resolveDeptIdByName(  // see Step 5
        Long.parseLong(user.getUniversityId()), user.getDepartment());
    if (deptId != null) response.put("deptId", deptId);
}
```

- [ ] **Step 5:** Extract the dept-name walk used in DeptAdminController into a reusable public method on `AdminService`:

```java
public Long resolveDeptIdByName(Long universityId, String deptName) {
    return collegeSchoolRepository.findByUniversityIdOrderByIdAsc(universityId).stream()
        .flatMap(s -> facultyGroupRepository.findBySchoolIdOrderByIdAsc(s.getId()).stream())
        .flatMap(f -> departmentRepository.findByFacultyIdOrderByIdAsc(f.getId()).stream())
        .filter(d -> deptName.equals(d.getName()))
        .map(Department::getId)
        .findFirst().orElse(null);
}
```

`DeptAdminController#resolveDeptId` for the DEPT_ADMIN branch should use this helper.

- [ ] **Step 6:** Inject `AdminService` into `AuthService` constructor. Add `private final AdminService adminService;` and update the constructor.

- [ ] **Step 7:** Compile + typecheck + build.

```bash
cd demo/demo && ./mvnw.cmd compile -q
cd ../../frontend && npx tsc --noEmit && npm run build
```

- [ ] **Step 8:** Commit.

```bash
git add frontend/src/App.tsx frontend/src/components/common/AdminBanner.tsx \
        frontend/src/pages/LoginPage.tsx \
        demo/demo/src/main/java/com/example/demo/service/AuthService.java \
        demo/demo/src/main/java/com/example/demo/service/AdminService.java \
        demo/demo/src/main/java/com/example/demo/controller/DeptAdminController.java \
        demo/demo/src/main/resources/static/index.html \
        demo/demo/src/main/resources/static/assets/
git commit -m "feat: /admin/faculty route + DEPT_ADMIN deptId persisted on login"
```

---

### Task 10: Smoke test

- [ ] **Step 1:** Stop any running Spring Boot, restart:

```bash
cd demo/demo && ./mvnw.cmd spring-boot:run
```
Wait for "Started DemoApplication".

- [ ] **Step 2:** Quick HTTP probes (unauthenticated → 403):

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/admin/dept/stats
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/admin/faculty/stats
```
Expected: 403 for both.

- [ ] **Step 3:** Browser checks:
  - SUPER_ADMIN: open `/admin/dept/5?deptId=5` → all tabs load.
  - SCHOOL_ADMIN of universityId=1: open `/admin/dept/5` (a dept under their univ) → loads; `/admin/dept/{other-univ-dept}` → bounces to `/universities`.
  - DEPT_ADMIN: log in → sessionStorage has deptId → `/universities` shows admin banner pointing at `/admin/dept/{their id}` → page loads.
  - `/admin/faculty/:id` blocks DEPT_ADMIN at the route guard.

- [ ] **Step 4:** No commit (no code changes).

---

## Self-Review

- All spec sections (1–9) are covered by tasks above.
- No placeholders (TBD / TODO / "fill in later") remain in this plan.
- Method names are consistent: `getDept*` / `getFaculty*` / `deptToUnivId` / `facultyToUnivId` / `resolveDeptId` / `resolveFacultyId` / `resolveDeptIdByName`.
- `AdminService.resolveDeptIdByName` is defined in Task 9 Step 5 and used in Task 2 (DeptAdminController) and Task 9 (AuthService). Task 2 should reference it via the same helper — implementer should pull it forward to Task 2 if convenient or temporarily duplicate and refactor in Task 9.
