# Professor-Course Assignment Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** RBAC-aware professor-course assignment management — Dept Admin manages assignments within their department; School Admin manages assignments across their school; Super Admin page excluded.

**Architecture:** New `PROFESSOR_COURSE_ASSIGNMENTS` JPA entity + repository; service methods added to `AdminService`; 5 new endpoints each in `DeptAdminController` and `SchoolAdminController`; frontend API additions to `adminDept.ts` / `adminSchool.ts`; new '교수 배정' tab in `DeptAdminPage` and `SchoolAdminPage`. All scope enforcement reuses the existing `resolveDeptId` / `resolveUnivId` helpers.

**Tech Stack:** Spring Boot + JPA (Hibernate DDL), H2/Oracle, Java 21; React 19 + TypeScript + Tailwind; Vitest + Testing Library (existing 88 tests must stay green)

---

## File Map

| Action | Path |
|--------|------|
| Create | `demo/demo/src/main/java/com/example/demo/entity/ProfessorCourseAssignment.java` |
| Create | `demo/demo/src/main/java/com/example/demo/repository/ProfessorCourseAssignmentRepository.java` |
| Modify | `demo/demo/src/main/java/com/example/demo/service/AdminService.java` |
| Modify | `demo/demo/src/main/java/com/example/demo/controller/DeptAdminController.java` |
| Modify | `demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java` |
| Modify | `frontend/src/api/adminDept.ts` |
| Modify | `frontend/src/api/adminSchool.ts` |
| Modify | `frontend/src/pages/admin/DeptAdminPage.tsx` |
| Modify | `frontend/src/pages/admin/SchoolAdminPage.tsx` |

---

## Task 1: ProfessorCourseAssignment entity + Repository

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/entity/ProfessorCourseAssignment.java`
- Create: `demo/demo/src/main/java/com/example/demo/repository/ProfessorCourseAssignmentRepository.java`

- [x] **Step 1: Create entity**

```java
// demo/demo/src/main/java/com/example/demo/entity/ProfessorCourseAssignment.java
package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "PROFESSOR_COURSE_ASSIGNMENTS",
    uniqueConstraints = @UniqueConstraint(columnNames = {"professor_id", "course_id"})
)
public class ProfessorCourseAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "professor_id", nullable = false)
    private Long professorId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    // Denormalised for fast scope filtering — set on write, never updated
    @Column(name = "dept_id", nullable = false)
    private Long deptId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProfessorId() { return professorId; }
    public void setProfessorId(Long professorId) { this.professorId = professorId; }
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public Long getDeptId() { return deptId; }
    public void setDeptId(Long deptId) { this.deptId = deptId; }
}
```

- [x] **Step 2: Create repository**

```java
// demo/demo/src/main/java/com/example/demo/repository/ProfessorCourseAssignmentRepository.java
package com.example.demo.repository;

import com.example.demo.entity.ProfessorCourseAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfessorCourseAssignmentRepository extends JpaRepository<ProfessorCourseAssignment, Long> {
    List<ProfessorCourseAssignment> findByDeptId(Long deptId);
    List<ProfessorCourseAssignment> findByDeptIdIn(List<Long> deptIds);
    boolean existsByProfessorIdAndCourseId(Long professorId, Long courseId);
}
```

- [x] **Step 3: Start the Spring Boot server and verify Hibernate creates the table**

Run in project root (PowerShell):
```powershell
cd demo\demo
.\mvnw.cmd spring-boot:run
```

Expected: Server starts on port 8080. In the log, search for:
```
Hibernate: create table PROFESSOR_COURSE_ASSIGNMENTS
```
(H2 DDL auto-create runs on startup.)

- [x] **Step 4: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/entity/ProfessorCourseAssignment.java
git add demo/demo/src/main/java/com/example/demo/repository/ProfessorCourseAssignmentRepository.java
git commit -m "feat: add ProfessorCourseAssignment entity and repository"
```

---

## Task 2: AdminService — professor/course/assignment query methods

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/service/AdminService.java`

The service already has injected repos for `DepartmentRepository`, `FacultyGroupRepository`, `CollegeSchoolRepository`. Add the new repositories and 8 new methods.

- [x] **Step 1: Read the current top of AdminService to find the field declarations and constructor**

Read `AdminService.java` lines 1–80 to find existing fields and constructor signature.

- [x] **Step 2: Add new repository fields and inject via constructor**

Find the constructor in AdminService. Add two new fields and constructor parameters:

```java
// New field declarations (add alongside existing repo fields):
private final ProfessorRepository professorRepository;
private final CurriculumItemRepository curriculumItemRepository;
private final ProfessorCourseAssignmentRepository assignmentRepository;
private final FacultyGroupRepository facultyGroupRepository;   // may already exist
private final CollegeSchoolRepository collegeSchoolRepository; // may already exist
private final DepartmentRepository departmentRepository;       // may already exist
```

In the constructor, add corresponding parameters and `this.xxx = xxx` assignments for any of the above that aren't already injected.

- [x] **Step 3: Add 8 new public methods**

Add these methods to `AdminService.java`. Add the necessary imports (`Professor`, `CurriculumItem`, `ProfessorCourseAssignment`, `ProfessorCourseAssignmentRepository`, `List`, `Map`, `HashMap`, `stream`).

```java
// --- Professor / Course listing ---

public List<Map<String, Object>> getProfessorsByDept(Long deptId) {
    return professorRepository.findByDeptId(deptId).stream().map(p -> {
        Map<String, Object> m = new HashMap<>();
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("specialty", p.getSpecialty());
        m.put("email", p.getEmail());
        return m;
    }).toList();
}

public List<Map<String, Object>> getProfessorsByUniv(Long univId) {
    List<Long> deptIds = getDeptIdsForUniv(univId);
    return professorRepository.findAll().stream()
        .filter(p -> deptIds.contains(p.getDeptId()))
        .map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("specialty", p.getSpecialty());
            m.put("email", p.getEmail());
            m.put("deptId", p.getDeptId());
            return m;
        }).toList();
}

public List<Map<String, Object>> getCoursesByDept(Long deptId) {
    return curriculumItemRepository.findByDeptId(deptId).stream().map(c -> {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("name", c.getName());
        m.put("year", c.getYear());
        m.put("credits", c.getCredits());
        m.put("required", c.isRequired());
        return m;
    }).toList();
}

public List<Map<String, Object>> getCoursesByUniv(Long univId) {
    List<Long> deptIds = getDeptIdsForUniv(univId);
    return curriculumItemRepository.findAll().stream()
        .filter(c -> deptIds.contains(c.getDeptId()))
        .map(c -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", c.getId());
            m.put("name", c.getName());
            m.put("year", c.getYear());
            m.put("credits", c.getCredits());
            m.put("required", c.isRequired());
            m.put("deptId", c.getDeptId());
            return m;
        }).toList();
}

// --- Assignment listing ---

public List<Map<String, Object>> getAssignmentsByDept(Long deptId) {
    return assignmentRepository.findByDeptId(deptId).stream()
        .map(a -> buildAssignmentDto(a)).toList();
}

public List<Map<String, Object>> getAssignmentsByUniv(Long univId) {
    List<Long> deptIds = getDeptIdsForUniv(univId);
    return assignmentRepository.findByDeptIdIn(deptIds).stream()
        .map(a -> buildAssignmentDto(a)).toList();
}

// --- Assignment CRUD ---

public Map<String, Object> createAssignment(Long professorId, Long courseId, Long deptId) {
    if (assignmentRepository.existsByProfessorIdAndCourseId(professorId, courseId)) {
        throw new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.CONFLICT, "이미 배정된 강의입니다");
    }
    Professor prof = professorRepository.findById(professorId)
        .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.NOT_FOUND, "교수 없음"));
    if (!prof.getDeptId().equals(deptId)) {
        throw new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.FORBIDDEN, "해당 범위의 교수가 아닙니다");
    }
    CurriculumItem course = curriculumItemRepository.findById(courseId)
        .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.NOT_FOUND, "강의 없음"));
    if (!course.getDeptId().equals(deptId)) {
        throw new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.FORBIDDEN, "해당 범위의 강의가 아닙니다");
    }
    ProfessorCourseAssignment a = new ProfessorCourseAssignment();
    a.setProfessorId(professorId);
    a.setCourseId(courseId);
    a.setDeptId(deptId);
    ProfessorCourseAssignment saved = assignmentRepository.save(a);
    return buildAssignmentDto(saved);
}

public void deleteAssignment(Long assignmentId, List<Long> allowedDeptIds) {
    ProfessorCourseAssignment a = assignmentRepository.findById(assignmentId)
        .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.NOT_FOUND, "배정 없음"));
    if (!allowedDeptIds.contains(a.getDeptId())) {
        throw new org.springframework.web.server.ResponseStatusException(
            org.springframework.http.HttpStatus.FORBIDDEN, "삭제 권한 없음");
    }
    assignmentRepository.deleteById(assignmentId);
}

// --- Private helpers ---

private List<Long> getDeptIdsForUniv(Long univId) {
    return collegeSchoolRepository.findByUniversityId(univId).stream()
        .flatMap(cs -> facultyGroupRepository.findBySchoolId(cs.getId()).stream())
        .flatMap(fg -> departmentRepository.findByFacultyId(fg.getId()).stream())
        .map(d -> d.getId())
        .toList();
}

private Map<String, Object> buildAssignmentDto(ProfessorCourseAssignment a) {
    Map<String, Object> m = new HashMap<>();
    m.put("id", a.getId());
    m.put("professorId", a.getProfessorId());
    m.put("courseId", a.getCourseId());
    m.put("deptId", a.getDeptId());
    professorRepository.findById(a.getProfessorId()).ifPresent(p -> m.put("professorName", p.getName()));
    curriculumItemRepository.findById(a.getCourseId()).ifPresent(c -> m.put("courseName", c.getName()));
    return m;
}
```

- [x] **Step 4: Check that `CollegeSchoolRepository` has `findByUniversityId`, `FacultyGroupRepository` has `findBySchoolId`, `DepartmentRepository` has `findByFacultyId`**

Read those three repository files. If a method is missing, add a derived query method:

```java
// CollegeSchoolRepository — add if missing:
List<CollegeSchool> findByUniversityId(Long universityId);

// FacultyGroupRepository — add if missing:
List<FacultyGroup> findBySchoolId(Long schoolId);

// DepartmentRepository — add if missing:
List<Department> findByFacultyId(Long facultyId);
```

- [x] **Step 5: Compile the backend**

```powershell
cd demo\demo
.\mvnw.cmd compile -q
```

Expected: BUILD SUCCESS, no errors.

- [x] **Step 6: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/service/AdminService.java
git add demo/demo/src/main/java/com/example/demo/repository/CollegeSchoolRepository.java
git add demo/demo/src/main/java/com/example/demo/repository/FacultyGroupRepository.java
git add demo/demo/src/main/java/com/example/demo/repository/DepartmentRepository.java
git commit -m "feat: add professor/course/assignment service methods to AdminService"
```

---

## Task 3: DeptAdminController — 5 new endpoints

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/controller/DeptAdminController.java`

Add `ProfessorCourseAssignmentRepository` only if needed for scope check (it's already in service), and `AdminService` already does all the work. Only 5 new `@GetMapping`/`@PostMapping`/`@DeleteMapping` methods are needed.

- [x] **Step 1: Add 5 new endpoint methods to `DeptAdminController`**

Add these after the existing endpoints in the class. The `resolveDeptId` helper and `adminService` are already available.

```java
// In DeptAdminController.java — add these methods:

@GetMapping("/professors")
public ResponseEntity<List<Map<String, Object>>> getProfessors(
        @RequestHeader(value = "X-Username", required = false) String username,
        @RequestParam(required = false) Long deptId) {
    Long id = resolveDeptId(username, deptId);
    return ResponseEntity.ok(adminService.getProfessorsByDept(id));
}

@GetMapping("/courses")
public ResponseEntity<List<Map<String, Object>>> getCourses(
        @RequestHeader(value = "X-Username", required = false) String username,
        @RequestParam(required = false) Long deptId) {
    Long id = resolveDeptId(username, deptId);
    return ResponseEntity.ok(adminService.getCoursesByDept(id));
}

@GetMapping("/assignments")
public ResponseEntity<List<Map<String, Object>>> getAssignments(
        @RequestHeader(value = "X-Username", required = false) String username,
        @RequestParam(required = false) Long deptId) {
    Long id = resolveDeptId(username, deptId);
    return ResponseEntity.ok(adminService.getAssignmentsByDept(id));
}

@PostMapping("/assignments")
public ResponseEntity<Map<String, Object>> createAssignment(
        @RequestHeader(value = "X-Username", required = false) String username,
        @RequestParam(required = false) Long deptId,
        @RequestBody Map<String, Long> body) {
    Long id = resolveDeptId(username, deptId);
    Long professorId = body.get("professorId");
    Long courseId    = body.get("courseId");
    if (professorId == null || courseId == null) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "professorId, courseId 필수");
    }
    return ResponseEntity.ok(adminService.createAssignment(professorId, courseId, id));
}

@DeleteMapping("/assignments/{assignmentId}")
public ResponseEntity<Void> deleteAssignment(
        @RequestHeader(value = "X-Username", required = false) String username,
        @PathVariable Long assignmentId,
        @RequestParam(required = false) Long deptId) {
    Long id = resolveDeptId(username, deptId);
    adminService.deleteAssignment(assignmentId, List.of(id));
    return ResponseEntity.noContent().build();
}
```

Add `import java.util.List;` if not already present.

- [x] **Step 2: Compile**

```powershell
cd demo\demo
.\mvnw.cmd compile -q
```

Expected: BUILD SUCCESS.

- [x] **Step 3: Smoke test with curl (server must be running)**

```bash
# List professors (DEPT_ADMIN session required; use a known DEPT_ADMIN username)
curl -s -H "X-Username: dept_admin_user" http://localhost:8080/api/admin/dept/professors
```

Expected: JSON array (may be empty `[]` if no seed data, but must not be 403/500).

- [x] **Step 4: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/DeptAdminController.java
git commit -m "feat: add professor/course/assignment endpoints to DeptAdminController"
```

---

## Task 4: SchoolAdminController — 5 new endpoints

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java`

Same pattern as Task 3, but using `resolveUnivId` and the `*ByUniv` service methods.

- [x] **Step 1: Add 5 new endpoint methods to `SchoolAdminController`**

```java
// In SchoolAdminController.java — add these methods:

@GetMapping("/professors")
public ResponseEntity<List<Map<String, Object>>> getProfessors(
        @RequestHeader(value = "X-Username", required = false) String username,
        @RequestParam(required = false) Long univId) {
    Long id = resolveUnivId(username, univId);
    return ResponseEntity.ok(adminService.getProfessorsByUniv(id));
}

@GetMapping("/courses")
public ResponseEntity<List<Map<String, Object>>> getCourses(
        @RequestHeader(value = "X-Username", required = false) String username,
        @RequestParam(required = false) Long univId) {
    Long id = resolveUnivId(username, univId);
    return ResponseEntity.ok(adminService.getCoursesByUniv(id));
}

@GetMapping("/assignments")
public ResponseEntity<List<Map<String, Object>>> getAssignments(
        @RequestHeader(value = "X-Username", required = false) String username,
        @RequestParam(required = false) Long univId) {
    Long id = resolveUnivId(username, univId);
    return ResponseEntity.ok(adminService.getAssignmentsByUniv(id));
}

@PostMapping("/assignments")
public ResponseEntity<Map<String, Object>> createAssignment(
        @RequestHeader(value = "X-Username", required = false) String username,
        @RequestParam(required = false) Long univId,
        @RequestBody Map<String, Long> body) {
    Long id          = resolveUnivId(username, univId);
    Long professorId = body.get("professorId");
    Long courseId    = body.get("courseId");
    Long deptId      = body.get("deptId");
    if (professorId == null || courseId == null || deptId == null) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "professorId, courseId, deptId 필수");
    }
    // Verify deptId is within the school
    List<Long> allowed = adminService.getDeptIdsForUnivPublic(id);
    if (!allowed.contains(deptId)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 학과는 본 학교 소속이 아닙니다");
    }
    return ResponseEntity.ok(adminService.createAssignment(professorId, courseId, deptId));
}

@DeleteMapping("/assignments/{assignmentId}")
public ResponseEntity<Void> deleteAssignment(
        @RequestHeader(value = "X-Username", required = false) String username,
        @PathVariable Long assignmentId,
        @RequestParam(required = false) Long univId) {
    Long id = resolveUnivId(username, univId);
    List<Long> deptIds = adminService.getDeptIdsForUnivPublic(id);
    adminService.deleteAssignment(assignmentId, deptIds);
    return ResponseEntity.noContent().build();
}
```

Add `import java.util.List;` if not already present.

- [x] **Step 2: Expose `getDeptIdsForUnivPublic` in AdminService**

The `getDeptIdsForUniv` helper is currently private. Add a public wrapper:

```java
// In AdminService.java:
public List<Long> getDeptIdsForUnivPublic(Long univId) {
    return getDeptIdsForUniv(univId);
}
```

- [x] **Step 3: Compile**

```powershell
cd demo\demo
.\mvnw.cmd compile -q
```

Expected: BUILD SUCCESS.

- [x] **Step 4: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java
git add demo/demo/src/main/java/com/example/demo/service/AdminService.java
git commit -m "feat: add professor/course/assignment endpoints to SchoolAdminController"
```

---

## Task 5: Frontend — Dept Admin '교수 배정' tab

**Files:**
- Modify: `frontend/src/api/adminDept.ts`
- Modify: `frontend/src/pages/admin/DeptAdminPage.tsx`

### Part A: adminDept.ts additions

- [x] **Step 1: Add TypeScript interfaces and API functions to `adminDept.ts`**

Append to the end of `frontend/src/api/adminDept.ts`:

```typescript
export interface ProfessorItem {
  id: number
  name: string
  specialty: string | null
  email: string | null
}

export interface CourseItem {
  id: number
  name: string
  year: string | null
  credits: number
  required: boolean
}

export interface AssignmentItem {
  id: number
  professorId: number
  courseId: number
  deptId: number
  professorName: string
  courseName: string
}

export async function fetchDeptProfessors(deptId?: number): Promise<ProfessorItem[]> {
  const res = await fetch('/api/admin/dept/professors' + qs(deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchDeptCourses(deptId?: number): Promise<CourseItem[]> {
  const res = await fetch('/api/admin/dept/courses' + qs(deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchDeptAssignments(deptId?: number): Promise<AssignmentItem[]> {
  const res = await fetch('/api/admin/dept/assignments' + qs(deptParam(deptId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function createDeptAssignment(
  professorId: number, courseId: number, deptId?: number
): Promise<AssignmentItem> {
  const res = await fetch('/api/admin/dept/assignments' + qs(deptParam(deptId)), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ professorId, courseId }),
  })
  handle403(res)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteDeptAssignment(assignmentId: number, deptId?: number): Promise<void> {
  const res = await fetch(
    `/api/admin/dept/assignments/${assignmentId}` + qs(deptParam(deptId)),
    { method: 'DELETE', headers: headers() }
  )
  handle403(res)
}
```

### Part B: DeptAdminPage.tsx — '교수 배정' tab

- [x] **Step 2: Add '교수 배정' to the Tab type and TABS array in `DeptAdminPage.tsx`**

Find this line:
```typescript
type Tab = '개요' | '학과 페이지' | '게시글 관리' | '공지 관리' | '사용자' | '통계'
const TABS: Tab[] = ['개요', '학과 페이지', '게시글 관리', '공지 관리', '사용자', '통계']
```

Replace with:
```typescript
type Tab = '개요' | '학과 페이지' | '게시글 관리' | '공지 관리' | '사용자' | '통계' | '교수 배정'
const TABS: Tab[] = ['개요', '학과 페이지', '게시글 관리', '공지 관리', '사용자', '통계', '교수 배정']
```

- [x] **Step 3: Add import for the new API functions**

Find the existing import from `../../api/adminDept`:
```typescript
import {
  fetchDeptStats, fetchDeptVisitors, fetchDeptMonthlyStats,
  fetchDeptPosts, deleteDeptPost,
  fetchDeptNotices, deleteDeptNotice,
  fetchDeptUsers, updateDeptUserStatus,
} from '../../api/adminDept'
import type {
  DeptStats, VisitorPoint, PostItem, NoticeItem, AdminUser, MonthlyStats,
} from '../../api/adminDept'
```

Add the new functions and types to those imports:
```typescript
import {
  fetchDeptStats, fetchDeptVisitors, fetchDeptMonthlyStats,
  fetchDeptPosts, deleteDeptPost,
  fetchDeptNotices, deleteDeptNotice,
  fetchDeptUsers, updateDeptUserStatus,
  fetchDeptProfessors, fetchDeptCourses, fetchDeptAssignments,
  createDeptAssignment, deleteDeptAssignment,
} from '../../api/adminDept'
import type {
  DeptStats, VisitorPoint, PostItem, NoticeItem, AdminUser, MonthlyStats,
  ProfessorItem, CourseItem, AssignmentItem,
} from '../../api/adminDept'
```

- [x] **Step 4: Add state variables for the '교수 배정' tab**

In the `DeptAdminPage` function body, after the existing state declarations, add:
```typescript
const [professors, setProfessors]   = useState<ProfessorItem[]>([])
const [courses, setCourses]         = useState<CourseItem[]>([])
const [assignments, setAssignments] = useState<AssignmentItem[]>([])
const [selProfId, setSelProfId]     = useState<number | ''>('')
const [selCourseId, setSelCourseId] = useState<number | ''>('')
const [assignError, setAssignError] = useState<string | null>(null)
```

- [x] **Step 5: Load professors/courses/assignments when switching to the tab**

Add a `useEffect` after the existing `useEffect` blocks:
```typescript
useEffect(() => {
  if (tab !== '교수 배정') return
  Promise.all([
    fetchDeptProfessors(deptId),
    fetchDeptCourses(deptId),
    fetchDeptAssignments(deptId),
  ]).then(([p, c, a]) => { setProfessors(p); setCourses(c); setAssignments(a) })
}, [tab])
```

- [x] **Step 6: Add handlers for create/delete assignment**

```typescript
const handleCreateAssignment = async () => {
  if (selProfId === '' || selCourseId === '') {
    setAssignError('교수와 강의를 모두 선택하세요')
    return
  }
  try {
    await createDeptAssignment(selProfId, selCourseId, deptId)
    const updated = await fetchDeptAssignments(deptId)
    setAssignments(updated)
    setSelProfId('')
    setSelCourseId('')
    setAssignError(null)
  } catch (e: unknown) {
    setAssignError(e instanceof Error ? e.message : '배정 실패')
  }
}

const handleDeleteAssignment = async (assignmentId: number) => {
  if (!window.confirm('배정을 취소하시겠습니까?')) return
  await deleteDeptAssignment(assignmentId, deptId)
  setAssignments(prev => prev.filter(a => a.id !== assignmentId))
}
```

- [x] **Step 7: Add the '교수 배정' tab content block**

In the `<main>` section of the JSX, after the last existing `{tab === '통계' && (...)}` block, add:

```tsx
{tab === '교수 배정' && (
  <div className="space-y-6">
    {/* Create assignment form */}
    <div className="border-2 border-black p-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">교수 배정 추가</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">교수 선택</label>
          <select
            value={selProfId}
            onChange={e => setSelProfId(e.target.value === '' ? '' : Number(e.target.value))}
            className="border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:border-black min-w-48"
          >
            <option value="">-- 교수 선택 --</option>
            {professors.map(p => (
              <option key={p.id} value={p.id}>{p.name}{p.specialty ? ` (${p.specialty})` : ''}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">강의 선택</label>
          <select
            value={selCourseId}
            onChange={e => setSelCourseId(e.target.value === '' ? '' : Number(e.target.value))}
            className="border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:border-black min-w-48"
          >
            <option value="">-- 강의 선택 --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.year ? ` (${c.year})` : ''}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCreateAssignment}
          className="border-2 border-black bg-black text-white text-sm px-5 py-2 hover:bg-white hover:text-black transition"
        >
          배정 추가
        </button>
      </div>
      {assignError && <p className="text-red-500 text-xs mt-2">{assignError}</p>}
    </div>

    {/* Assignment list */}
    <div className="border-2 border-black p-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">현재 배정 목록</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
              <th className="text-left pb-3 pr-4">교수</th>
              <th className="text-left pb-3 pr-4">강의</th>
              <th className="text-left pb-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a, i) => (
              <tr key={a.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                <td className="py-3 pr-4 font-medium">{a.professorName}</td>
                <td className="py-3 pr-4 text-gray-600">{a.courseName}</td>
                <td className="py-3">
                  <button
                    onClick={() => handleDeleteAssignment(a.id)}
                    className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition"
                  >취소</button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr><td colSpan={3} className="py-8 text-center text-gray-400 text-sm">배정된 강의가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}
```

- [x] **Step 8: TypeScript check**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: No errors.

- [x] **Step 9: Run tests**

```powershell
cd frontend
npx vitest run
```

Expected: All 88 tests pass.

- [x] **Step 10: Commit**

```bash
git add frontend/src/api/adminDept.ts
git add frontend/src/pages/admin/DeptAdminPage.tsx
git commit -m "feat: add 교수 배정 tab to DeptAdminPage"
```

---

## Task 6: Frontend — School Admin '교수 배정' tab

**Files:**
- Modify: `frontend/src/api/adminSchool.ts`
- Modify: `frontend/src/pages/admin/SchoolAdminPage.tsx`

### Part A: adminSchool.ts additions

- [x] **Step 1: Append to `frontend/src/api/adminSchool.ts`**

```typescript
export interface ProfessorItem {
  id: number
  name: string
  specialty: string | null
  email: string | null
  deptId: number
}

export interface CourseItem {
  id: number
  name: string
  year: string | null
  credits: number
  required: boolean
  deptId: number
}

export interface AssignmentItem {
  id: number
  professorId: number
  courseId: number
  deptId: number
  professorName: string
  courseName: string
}

export async function fetchSchoolProfessors(univId?: number): Promise<ProfessorItem[]> {
  const res = await fetch('/api/admin/school/professors' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolCourses(univId?: number): Promise<CourseItem[]> {
  const res = await fetch('/api/admin/school/courses' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolAssignments(univId?: number): Promise<AssignmentItem[]> {
  const res = await fetch('/api/admin/school/assignments' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function createSchoolAssignment(
  professorId: number, courseId: number, deptId: number, univId?: number
): Promise<AssignmentItem> {
  const res = await fetch('/api/admin/school/assignments' + qs(univParam(univId)), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ professorId, courseId, deptId }),
  })
  handle403(res)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteSchoolAssignment(assignmentId: number, univId?: number): Promise<void> {
  const res = await fetch(
    `/api/admin/school/assignments/${assignmentId}` + qs(univParam(univId)),
    { method: 'DELETE', headers: headers() }
  )
  handle403(res)
}
```

### Part B: SchoolAdminPage.tsx — '교수 배정' tab

- [x] **Step 2: Add '교수 배정' to Tab type and TABS array**

Find:
```typescript
type Tab = '개요' | '게시글 관리' | '전체 사용자' | '가입 승인' | '관리자 계정' | '활동 로그'
const TABS: Tab[] = ['개요', '게시글 관리', '전체 사용자', '가입 승인', '관리자 계정', '활동 로그']
```

Replace with:
```typescript
type Tab = '개요' | '게시글 관리' | '전체 사용자' | '가입 승인' | '관리자 계정' | '활동 로그' | '교수 배정'
const TABS: Tab[] = ['개요', '게시글 관리', '전체 사용자', '가입 승인', '관리자 계정', '활동 로그', '교수 배정']
```

- [x] **Step 3: Add imports for new API functions**

Find the existing import block from `../../api/adminSchool`. Add to the named imports:
```typescript
import {
  fetchSchoolStats, fetchSchoolVisitors, fetchSchoolPosts,
  deleteSchoolPost, fetchSchoolUsers, updateSchoolUserRole,
  fetchSchoolAllUsers, fetchSchoolPendingUsers, updateUserStatus,
  fetchAdminLogs, fetchSchoolMonthlyStats,
  fetchSchoolProfessors, fetchSchoolCourses, fetchSchoolAssignments,
  createSchoolAssignment, deleteSchoolAssignment,
} from '../../api/adminSchool'
import type {
  SchoolStats, VisitorPoint, PostItem, AdminUser, AdminLog, MonthlyStats,
  ProfessorItem, CourseItem, AssignmentItem,
} from '../../api/adminSchool'
```

- [x] **Step 4: Add state variables**

In the `SchoolAdminPage` function body, after the existing state declarations, add:
```typescript
const [professors, setProfessors]   = useState<ProfessorItem[]>([])
const [courses, setCourses]         = useState<CourseItem[]>([])
const [assignments, setAssignments] = useState<AssignmentItem[]>([])
const [selProfId, setSelProfId]     = useState<number | ''>('')
const [selCourseId, setSelCourseId] = useState<number | ''>('')
const [selDeptId, setSelDeptId]     = useState<number | ''>('')
const [assignError, setAssignError] = useState<string | null>(null)
```

- [x] **Step 5: Add useEffect for tab data loading**

Add after the existing `useEffect` for posts:
```typescript
useEffect(() => {
  if (tab !== '교수 배정') return
  Promise.all([
    fetchSchoolProfessors(univId),
    fetchSchoolCourses(univId),
    fetchSchoolAssignments(univId),
  ]).then(([p, c, a]) => { setProfessors(p); setCourses(c); setAssignments(a) })
}, [tab])
```

- [x] **Step 6: Add handlers**

```typescript
const handleCreateSchoolAssignment = async () => {
  if (selProfId === '' || selCourseId === '' || selDeptId === '') {
    setAssignError('교수, 강의, 학과를 모두 선택하세요')
    return
  }
  try {
    await createSchoolAssignment(selProfId, selCourseId, selDeptId, univId)
    const updated = await fetchSchoolAssignments(univId)
    setAssignments(updated)
    setSelProfId(''); setSelCourseId(''); setSelDeptId('')
    setAssignError(null)
  } catch (e: unknown) {
    setAssignError(e instanceof Error ? e.message : '배정 실패')
  }
}

const handleDeleteSchoolAssignment = async (assignmentId: number) => {
  if (!window.confirm('배정을 취소하시겠습니까?')) return
  await deleteSchoolAssignment(assignmentId, univId)
  setAssignments(prev => prev.filter(a => a.id !== assignmentId))
}
```

- [x] **Step 7: Build a unique dept list from professors for the dept dropdown**

This is derived state — no separate useEffect needed. The unique deptIds come from the loaded professors list. Add a derived constant inside the render:

```tsx
// Inside the JSX, inside the tab === '교수 배정' block:
const uniqueDepts = Array.from(new Map(professors.map(p => [p.deptId, p.deptId])).keys())
```

- [x] **Step 8: Add the '교수 배정' tab JSX**

After the last existing `{tab === '활동 로그' && (...)}` block:

```tsx
{tab === '교수 배정' && (() => {
  const uniqueDeptIds = [...new Set(professors.map(p => p.deptId))]
  return (
    <div className="space-y-6">
      <div className="border-2 border-black p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">교수 배정 추가</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">학과 선택</label>
            <select
              value={selDeptId}
              onChange={e => { setSelDeptId(e.target.value === '' ? '' : Number(e.target.value)); setSelProfId(''); setSelCourseId('') }}
              className="border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:border-black min-w-40"
            >
              <option value="">-- 학과 --</option>
              {uniqueDeptIds.map(did => (
                <option key={did} value={did}>학과 #{did}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">교수 선택</label>
            <select
              value={selProfId}
              onChange={e => setSelProfId(e.target.value === '' ? '' : Number(e.target.value))}
              className="border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:border-black min-w-48"
            >
              <option value="">-- 교수 --</option>
              {professors
                .filter(p => selDeptId === '' || p.deptId === selDeptId)
                .map(p => (
                  <option key={p.id} value={p.id}>{p.name}{p.specialty ? ` (${p.specialty})` : ''}</option>
                ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">강의 선택</label>
            <select
              value={selCourseId}
              onChange={e => setSelCourseId(e.target.value === '' ? '' : Number(e.target.value))}
              className="border border-gray-300 text-sm px-3 py-2 focus:outline-none focus:border-black min-w-48"
            >
              <option value="">-- 강의 --</option>
              {courses
                .filter(c => selDeptId === '' || c.deptId === selDeptId)
                .map(c => (
                  <option key={c.id} value={c.id}>{c.name}{c.year ? ` (${c.year})` : ''}</option>
                ))}
            </select>
          </div>
          <button
            onClick={handleCreateSchoolAssignment}
            className="border-2 border-black bg-black text-white text-sm px-5 py-2 hover:bg-white hover:text-black transition"
          >
            배정 추가
          </button>
        </div>
        {assignError && <p className="text-red-500 text-xs mt-2">{assignError}</p>}
      </div>

      <div className="border-2 border-black p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">현재 배정 목록</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                <th className="text-left pb-3 pr-4">교수</th>
                <th className="text-left pb-3 pr-4">강의</th>
                <th className="text-left pb-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, i) => (
                <tr key={a.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                  <td className="py-3 pr-4 font-medium">{a.professorName}</td>
                  <td className="py-3 pr-4 text-gray-600">{a.courseName}</td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDeleteSchoolAssignment(a.id)}
                      className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition"
                    >취소</button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-gray-400 text-sm">배정된 강의가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
})()}
```

- [x] **Step 9: TypeScript check**

```powershell
cd frontend
npx tsc --noEmit
```

Expected: No errors.

- [x] **Step 10: Run tests**

```powershell
cd frontend
npx vitest run
```

Expected: All 88 tests pass.

- [x] **Step 11: Commit**

```bash
git add frontend/src/api/adminSchool.ts
git add frontend/src/pages/admin/SchoolAdminPage.tsx
git commit -m "feat: add 교수 배정 tab to SchoolAdminPage"
```

---

## Validation Checklist

After all tasks are complete:

1. **TypeScript**: `npx tsc --noEmit` — 0 errors
2. **Frontend tests**: `npx vitest run` — 88/88 pass
3. **Backend compiles**: `.\mvnw.cmd compile -q` — BUILD SUCCESS
4. **Dept Admin**: Log in as DEPT_ADMIN → `/dept/admin` → '교수 배정' tab visible; professors/courses from that dept only
5. **School Admin**: Log in as SCHOOL_ADMIN → `/school/admin` → '교수 배정' tab; professors/courses from all depts in the school
6. **Scope enforcement**: DEPT_ADMIN cannot create assignment for professor from a different dept (HTTP 403)
7. **Duplicate prevention**: Creating the same professor+course assignment twice returns HTTP 409
8. **Super Admin page**: No '교수 배정' tab visible (feature not added to any SuperAdmin-specific page)
