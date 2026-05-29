# School Admin v2 + Routing Bug Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Fix the SUPER_ADMIN routing bug blocking school admin access, replace `approved` boolean with a `status` enum, add AdminLog entity, extend SchoolAdminController to accept both roles, and rewrite SchoolAdminPage into a 6-tab dashboard with user management, approval queue, and activity log.

**Architecture:** Backend changes first (entity → repository → service → controller), then frontend (App.tsx route guard → API layer → page rewrite). Hibernate ddl-auto=update adds new columns but does NOT drop old ones, so the StatusMigrationRunner reads the still-present `APPROVED` column via native SQL to migrate existing data.

**Tech Stack:** Spring Boot 3 / JPA / Oracle (Hibernate ddl-auto=update), React 18 + TypeScript + Vite + Tailwind CSS, Chart.js 4 + react-chartjs-2 5, sessionStorage auth, X-Username header.

---

## File Map

**Create:**
- `demo/demo/src/main/java/com/example/demo/entity/AdminLog.java`
- `demo/demo/src/main/java/com/example/demo/repository/AdminLogRepository.java`
- `demo/demo/src/main/java/com/example/demo/util/StatusMigrationRunner.java`

**Modify:**
- `demo/demo/src/main/java/com/example/demo/entity/User.java` — remove `approved`, add `status`
- `demo/demo/src/main/java/com/example/demo/repository/UserRepository.java` — add queries
- `demo/demo/src/main/java/com/example/demo/repository/PageVisitRepository.java` — add IN-clause queries
- `demo/demo/src/main/java/com/example/demo/repository/PostRepository.java` — add date-range count
- `demo/demo/src/main/java/com/example/demo/util/AdminUserInitializer.java` — setStatus instead of setApproved
- `demo/demo/src/main/java/com/example/demo/service/AuthService.java` — status-based login
- `demo/demo/src/main/java/com/example/demo/service/AdminService.java` — new methods + logAction
- `demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java` — resolveUnivId + new endpoints
- `frontend/src/App.tsx` — ProtectedSchoolAdmin allows SUPER_ADMIN
- `frontend/src/api/adminSchool.ts` — univId param + new functions
- `frontend/src/pages/admin/SchoolAdminPage.tsx` — 6-tab rewrite

---

## Task 1: User entity — replace `approved` with `status` + AdminLog entity

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/entity/User.java`
- Create: `demo/demo/src/main/java/com/example/demo/entity/AdminLog.java`
- Create: `demo/demo/src/main/java/com/example/demo/repository/AdminLogRepository.java`

- [x] **Step 1: Replace `approved` field with `status` in User.java**

Replace the entire file content:

```java
package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "APP_USERS")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String memberType; // student, professor, admin

    private String universityId;
    private String college;
    private String department;
    private String studentId;
    private String phone;
    private Integer grade;

    // status: ACTIVE | PENDING_APPROVAL | SUSPENDED | DELETED
    @Column(nullable = false)
    private String status = "ACTIVE";

    private String adminRole; // SUPER_ADMIN | SCHOOL_ADMIN | DEPT_ADMIN | null

    private java.time.LocalDateTime createdDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getMemberType() { return memberType; }
    public void setMemberType(String memberType) { this.memberType = memberType; }
    public String getUniversityId() { return universityId; }
    public void setUniversityId(String universityId) { this.universityId = universityId; }
    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminRole() { return adminRole; }
    public void setAdminRole(String adminRole) { this.adminRole = adminRole; }
    public java.time.LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(java.time.LocalDateTime createdDate) { this.createdDate = createdDate; }
}
```

- [x] **Step 2: Create AdminLog.java**

Create `demo/demo/src/main/java/com/example/demo/entity/AdminLog.java`:

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ADMIN_LOGS")
public class AdminLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String actorUsername;

    // APPROVE | REJECT | SUSPEND | UNSUSPEND | DELETE | ROLE_GRANT | ROLE_REVOKE
    @Column(nullable = false, length = 50)
    private String actionType;

    @Column(length = 100)
    private String targetUsername;

    @Column(length = 500)
    private String detail;

    private Long universityId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getActorUsername() { return actorUsername; }
    public void setActorUsername(String actorUsername) { this.actorUsername = actorUsername; }
    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public String getTargetUsername() { return targetUsername; }
    public void setTargetUsername(String targetUsername) { this.targetUsername = targetUsername; }
    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
    public Long getUniversityId() { return universityId; }
    public void setUniversityId(Long universityId) { this.universityId = universityId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
```

- [x] **Step 3: Create AdminLogRepository.java**

Create `demo/demo/src/main/java/com/example/demo/repository/AdminLogRepository.java`:

```java
package com.example.demo.repository;

import com.example.demo.entity.AdminLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {
    List<AdminLog> findTop50ByUniversityIdOrderByCreatedAtDesc(Long universityId);
}
```

- [x] **Step 4: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/entity/User.java \
        demo/demo/src/main/java/com/example/demo/entity/AdminLog.java \
        demo/demo/src/main/java/com/example/demo/repository/AdminLogRepository.java
git commit -m "feat: replace approved with status in User, add AdminLog entity"
```

---

## Task 2: Repository queries — UserRepository + PageVisitRepository + PostRepository

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/repository/UserRepository.java`
- Modify: `demo/demo/src/main/java/com/example/demo/repository/PageVisitRepository.java`
- Modify: `demo/demo/src/main/java/com/example/demo/repository/PostRepository.java`

- [x] **Step 1: Update UserRepository**

Replace entire file:

```java
package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByNameAndPhone(String name, String phone);
    List<User> findByMemberType(String memberType);
    boolean existsByUsername(String username);

    List<User> findByAdminRoleIsNotNull();
    List<User> findByUniversityIdAndAdminRoleIsNotNull(String universityId);
    long countByCreatedDateAfter(LocalDateTime date);

    // School admin: all users in a university
    List<User> findByUniversityId(String universityId);

    // School admin: pending-approval users in a university
    List<User> findByUniversityIdAndStatus(String universityId, String status);

    // Monthly stats: signup count in a university within a date range
    long countByUniversityIdAndCreatedDateBetween(String universityId,
                                                   LocalDateTime start,
                                                   LocalDateTime end);
}
```

- [x] **Step 2: Update PageVisitRepository**

Replace entire file:

```java
package com.example.demo.repository;

import com.example.demo.entity.PageVisit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PageVisitRepository extends JpaRepository<PageVisit, Long> {
    List<PageVisit> findByVisitedAtAfter(LocalDateTime since);
    List<PageVisit> findByScopeTypeAndScopeIdAndVisitedAtAfter(String scopeType, Long scopeId, LocalDateTime since);
    long countByScopeTypeAndScopeIdAndVisitedAtAfter(String scopeType, Long scopeId, LocalDateTime since);

    // Aggregated: multiple scope IDs (use only when list is non-empty)
    List<PageVisit> findByScopeTypeAndScopeIdInAndVisitedAtAfter(String scopeType, List<Long> scopeIds, LocalDateTime since);
    long countByScopeTypeAndScopeIdInAndVisitedAtAfter(String scopeType, List<Long> scopeIds, LocalDateTime since);

    // Monthly range query
    long countByScopeTypeAndScopeIdAndVisitedAtBetween(String scopeType, Long scopeId,
                                                        LocalDateTime start, LocalDateTime end);
}
```

- [x] **Step 3: Update PostRepository**

Replace entire file:

```java
package com.example.demo.repository;

import com.example.demo.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByScopeTypeAndScopeIdOrderByCreatedDateDesc(String scopeType, Long scopeId);
    Page<Post> findByScopeTypeAndScopeId(String scopeType, Long scopeId, Pageable pageable);
    long countByScopeTypeAndScopeId(String scopeType, Long scopeId);

    // Monthly stats: post count in a date range
    long countByScopeTypeAndScopeIdAndCreatedDateBetween(String scopeType, Long scopeId,
                                                          LocalDateTime start, LocalDateTime end);
}
```

- [x] **Step 4: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/repository/UserRepository.java \
        demo/demo/src/main/java/com/example/demo/repository/PageVisitRepository.java \
        demo/demo/src/main/java/com/example/demo/repository/PostRepository.java
git commit -m "feat: add status/aggregated/monthly queries to repositories"
```

---

## Task 3: StatusMigrationRunner + AdminUserInitializer update

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/util/StatusMigrationRunner.java`
- Modify: `demo/demo/src/main/java/com/example/demo/util/AdminUserInitializer.java`

**Context:** `ddl-auto=update` adds the `STATUS` column but does NOT drop the `APPROVED` column from Oracle. StatusMigrationRunner reads the still-present `APPROVED` column via native SQL (Oracle stores boolean as NUMBER(1): 1=true, 0=false) and derives the correct status.

- [x] **Step 1: Create StatusMigrationRunner.java**

Create `demo/demo/src/main/java/com/example/demo/util/StatusMigrationRunner.java`:

```java
package com.example.demo.util;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(3)
public class StatusMigrationRunner implements CommandLineRunner {

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            // Oracle stores boolean as NUMBER(1): 1 = approved, 0 = not approved
            em.createNativeQuery(
                "UPDATE APP_USERS SET STATUS = 'ACTIVE' WHERE APPROVED = 1 AND STATUS IS NULL"
            ).executeUpdate();
            em.createNativeQuery(
                "UPDATE APP_USERS SET STATUS = 'PENDING_APPROVAL' WHERE APPROVED = 0 AND STATUS IS NULL"
            ).executeUpdate();
            // Default fallback for rows where APPROVED column doesn't exist or is null
            em.createNativeQuery(
                "UPDATE APP_USERS SET STATUS = 'ACTIVE' WHERE STATUS IS NULL"
            ).executeUpdate();
        } catch (Exception e) {
            // APPROVED column may not exist if schema is fresh; log and continue
            System.out.println("[StatusMigrationRunner] Migration skipped: " + e.getMessage());
        }
    }
}
```

- [x] **Step 2: Update AdminUserInitializer — replace setApproved with setStatus**

Replace the entire file:

```java
package com.example.demo.util;

import com.example.demo.entity.User;
import com.example.demo.repository.UniversityRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminUserInitializer(UserRepository userRepository,
                                 UniversityRepository universityRepository) {
        this.userRepository = userRepository;
        this.universityRepository = universityRepository;
    }

    @Override
    public void run(String... args) {
        String firstUnivId = universityRepository.findAll().stream()
                .findFirst()
                .map(u -> String.valueOf(u.getId()))
                .orElse("1");

        createIfAbsent("superadmin", "admin1234", "최고관리자", "SUPER_ADMIN", null, null);
        createIfAbsent("schooladmin", "admin1234", "학교관리자", "SCHOOL_ADMIN", firstUnivId, null);
        createIfAbsent("deptadmin", "admin1234", "학과관리자", "DEPT_ADMIN", firstUnivId, "컴퓨터공학과");

        patchUniversityId("schooladmin", firstUnivId);
        patchUniversityId("deptadmin", firstUnivId);
    }

    private void createIfAbsent(String username, String password, String name,
                                  String adminRole, String universityId, String department) {
        if (userRepository.existsByUsername(username)) return;
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setMemberType("admin");
        user.setStatus("ACTIVE");
        user.setAdminRole(adminRole);
        user.setUniversityId(universityId);
        user.setDepartment(department);
        userRepository.save(user);
    }

    private void patchUniversityId(String username, String universityId) {
        userRepository.findByUsername(username).ifPresent(user -> {
            if (user.getUniversityId() == null || user.getUniversityId().isBlank()) {
                user.setUniversityId(universityId);
                userRepository.save(user);
            }
        });
    }
}
```

- [x] **Step 3: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/util/StatusMigrationRunner.java \
        demo/demo/src/main/java/com/example/demo/util/AdminUserInitializer.java
git commit -m "feat: add StatusMigrationRunner, update AdminUserInitializer to use status"
```

---

## Task 4: AuthService — status-based login

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/service/AuthService.java`

- [x] **Step 1: Update login() to check status instead of approved**

Replace the `login()` method (lines 27–66). Only the `login()` and `signup()` methods change; everything else stays:

```java
public Map<String, Object> login(LoginRequestDto request) {
    Map<String, Object> response = new HashMap<>();
    Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

    if (userOpt.isEmpty()) {
        response.put("success", false);
        response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
        return response;
    }

    User user = userOpt.get();

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        response.put("success", false);
        response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
        return response;
    }

    if (!user.getMemberType().equals(request.getMemberType())) {
        response.put("success", false);
        response.put("message", "회원 유형이 일치하지 않습니다.");
        return response;
    }

    String status = user.getStatus() != null ? user.getStatus() : "ACTIVE";
    if ("PENDING_APPROVAL".equals(status)) {
        response.put("success", false);
        response.put("message", "관리자 승인 후 이용 가능합니다.");
        return response;
    }
    if ("SUSPENDED".equals(status)) {
        response.put("success", false);
        response.put("message", "계정이 정지되었습니다.");
        return response;
    }
    if ("DELETED".equals(status)) {
        response.put("success", false);
        response.put("message", "존재하지 않는 계정입니다.");
        return response;
    }

    response.put("success", true);
    response.put("message", "로그인 성공");
    response.put("memberType", user.getMemberType());
    response.put("username", user.getUsername());
    response.put("name", user.getName());
    response.put("grade", user.getGrade());
    response.put("adminRole", user.getAdminRole());
    response.put("universityId", user.getUniversityId());
    return response;
}
```

- [x] **Step 2: Update signup() to use setStatus**

Replace the `signup()` method (lines 68–96):

```java
public Map<String, Object> signup(SignupRequestDto request) {
    Map<String, Object> response = new HashMap<>();

    if (userRepository.existsByUsername(request.getUsername())) {
        response.put("success", false);
        response.put("message", "이미 사용 중인 아이디입니다.");
        return response;
    }

    User user = new User();
    user.setUsername(request.getUsername());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setName(request.getName());
    user.setMemberType(request.getMemberType());
    user.setUniversityId(request.getUniversityId());
    user.setCollege(request.getCollege());
    user.setDepartment(request.getDepartment());
    user.setStudentId(request.getStudentId());
    user.setPhone(request.getPhone());
    user.setGrade(request.getGrade());
    user.setStatus(request.getMemberType().equals("admin") ? "PENDING_APPROVAL" : "ACTIVE");
    user.setCreatedDate(java.time.LocalDateTime.now());

    userRepository.save(user);

    response.put("success", true);
    response.put("message", "회원가입이 완료되었습니다.");
    return response;
}
```

- [x] **Step 3: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/service/AuthService.java
git commit -m "feat: status-based login check in AuthService"
```

---

## Task 5: AdminService — new methods + logAction helper

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/service/AdminService.java`

**Context:** AdminService currently has `approveUser(Long, boolean)` which must be replaced by `updateUserStatus(Long, String, String, Long)`. Add `logAction()` helper, update `toUserMap()` to return `status` not `approved`, and add four new school-admin methods.

- [x] **Step 1: Replace AdminService.java entirely**

```java
package com.example.demo.service;

import com.example.demo.entity.AdminLog;
import com.example.demo.entity.PageVisit;
import com.example.demo.entity.Post;
import com.example.demo.entity.User;
import com.example.demo.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PageVisitRepository pageVisitRepository;
    private final PostRepository postRepository;
    private final NoticeRepository noticeRepository;
    private final UniversityRepository universityRepository;
    private final CollegeSchoolRepository collegeSchoolRepository;
    private final FacultyGroupRepository facultyGroupRepository;
    private final DepartmentRepository departmentRepository;
    private final AdminLogRepository adminLogRepository;

    public AdminService(UserRepository userRepository,
                        PageVisitRepository pageVisitRepository,
                        PostRepository postRepository,
                        NoticeRepository noticeRepository,
                        UniversityRepository universityRepository,
                        CollegeSchoolRepository collegeSchoolRepository,
                        FacultyGroupRepository facultyGroupRepository,
                        DepartmentRepository departmentRepository,
                        AdminLogRepository adminLogRepository) {
        this.userRepository = userRepository;
        this.pageVisitRepository = pageVisitRepository;
        this.postRepository = postRepository;
        this.noticeRepository = noticeRepository;
        this.universityRepository = universityRepository;
        this.collegeSchoolRepository = collegeSchoolRepository;
        this.facultyGroupRepository = facultyGroupRepository;
        this.departmentRepository = departmentRepository;
        this.adminLogRepository = adminLogRepository;
    }

    // ── Super Admin ──────────────────────────────────────────────────────────

    public Map<String, Object> getSuperStats() {
        long totalUsers = userRepository.count();
        long newUsers7d  = userRepository.countByCreatedDateAfter(LocalDateTime.now().minusDays(7));
        long newUsers30d = userRepository.countByCreatedDateAfter(LocalDateTime.now().minusDays(30));
        long totalSchools = universityRepository.count();

        Map<String, Object> result = new HashMap<>();
        result.put("totalUsers",   totalUsers);
        result.put("newUsers7d",   newUsers7d);
        result.put("newUsers30d",  newUsers30d);
        result.put("totalSchools", totalSchools);
        return result;
    }

    public List<Map<String, Object>> getGlobalVisitorTrend() {
        List<PageVisit> visits = pageVisitRepository
                .findByVisitedAtAfter(LocalDate.now().minusDays(29).atStartOfDay());
        return aggregateByDay(visits);
    }

    public Map<String, Object> getInfraStats() {
        Runtime rt = Runtime.getRuntime();
        long usedMB = (rt.totalMemory() - rt.freeMemory()) / 1024 / 1024;
        long maxMB  = rt.maxMemory() / 1024 / 1024;
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();

        Map<String, Object> result = new HashMap<>();
        result.put("usedMemoryMB",  usedMB);
        result.put("maxMemoryMB",   maxMB);
        result.put("activeThreads", Thread.activeCount());
        result.put("uptimeHours",   uptimeMs / 3_600_000);
        result.put("uptimeMinutes", (uptimeMs / 60_000) % 60);
        return result;
    }

    public List<Map<String, Object>> getAllAdminUsers() {
        return userRepository.findByAdminRoleIsNotNull()
                .stream().map(this::toUserMap).collect(Collectors.toList());
    }

    // ── School Admin ─────────────────────────────────────────────────────────

    public Map<String, Object> getSchoolStats(Long univId) {
        long totalPosts   = postRepository.countByScopeTypeAndScopeId("univ", univId);
        long totalNotices = noticeRepository.countByScopeTypeAndScopeId("univ", univId);
        long todayVisitors = getAggregatedTodayVisitors(univId);

        Map<String, Object> result = new HashMap<>();
        result.put("totalPosts",    totalPosts);
        result.put("totalNotices",  totalNotices);
        result.put("todayVisitors", todayVisitors);
        return result;
    }

    public List<Map<String, Object>> getSchoolVisitorTrend(Long univId) {
        LocalDateTime since = LocalDate.now().minusDays(29).atStartOfDay();
        List<PageVisit> univVisits = pageVisitRepository
                .findByScopeTypeAndScopeIdAndVisitedAtAfter("univ", univId, since);

        List<Long> facultyIds = getFacultyIds(univId);
        List<Long> deptIds = getDeptIds(facultyIds);

        List<PageVisit> all = new ArrayList<>(univVisits);
        if (!facultyIds.isEmpty()) {
            all.addAll(pageVisitRepository.findByScopeTypeAndScopeIdInAndVisitedAtAfter("faculty", facultyIds, since));
        }
        if (!deptIds.isEmpty()) {
            all.addAll(pageVisitRepository.findByScopeTypeAndScopeIdInAndVisitedAtAfter("dept", deptIds, since));
        }
        return aggregateByDay(all);
    }

    public Map<String, Object> getSchoolPosts(Long univId, int page) {
        Page<Post> postPage = postRepository.findByScopeTypeAndScopeId(
                "univ", univId,
                PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "createdDate")));

        List<Map<String, Object>> posts = postPage.getContent().stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id",          p.getId());
            m.put("title",       p.getTitle());
            m.put("author",      p.getAuthor());
            m.put("category",    p.getCategory());
            m.put("viewCount",   p.getViewCount());
            m.put("createdDate", p.getCreatedDate() != null ? p.getCreatedDate().toString() : "");
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("posts",         posts);
        result.put("totalPages",    postPage.getTotalPages());
        result.put("totalElements", postPage.getTotalElements());
        return result;
    }

    public List<Map<String, Object>> getSchoolAdminUsers(String universityId) {
        return userRepository.findByUniversityIdAndAdminRoleIsNotNull(universityId)
                .stream().map(this::toUserMap).collect(Collectors.toList());
    }

    // All users in the school (paginated — return all for simplicity, frontend paginates)
    public List<Map<String, Object>> getSchoolAllUsers(Long univId) {
        return userRepository.findByUniversityId(String.valueOf(univId))
                .stream().map(this::toUserMap).collect(Collectors.toList());
    }

    // Users awaiting approval
    public List<Map<String, Object>> getSchoolPendingUsers(Long univId) {
        return userRepository.findByUniversityIdAndStatus(String.valueOf(univId), "PENDING_APPROVAL")
                .stream().map(this::toUserMap).collect(Collectors.toList());
    }

    // Last 50 admin activity logs for the school
    public List<Map<String, Object>> getAdminLogs(Long univId) {
        return adminLogRepository.findTop50ByUniversityIdOrderByCreatedAtDesc(univId)
                .stream().map(log -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",             log.getId());
                    m.put("actionType",     log.getActionType());
                    m.put("actorUsername",  log.getActorUsername());
                    m.put("targetUsername", log.getTargetUsername());
                    m.put("detail",         log.getDetail());
                    m.put("createdAt",      log.getCreatedAt().toString());
                    return m;
                }).collect(Collectors.toList());
    }

    // 6-month monthly stats: signups, posts, visitors per month
    public List<Map<String, Object>> getSchoolMonthlyStats(Long univId) {
        String univIdStr = String.valueOf(univId);
        List<Map<String, Object>> result = new ArrayList<>();
        YearMonth now = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = now.minusMonths(i);
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end   = ym.atEndOfMonth().atTime(23, 59, 59);

            long signups  = userRepository.countByUniversityIdAndCreatedDateBetween(univIdStr, start, end);
            long posts    = postRepository.countByScopeTypeAndScopeIdAndCreatedDateBetween("univ", univId, start, end);
            long visitors = pageVisitRepository.countByScopeTypeAndScopeIdAndVisitedAtBetween("univ", univId, start, end);

            Map<String, Object> m = new HashMap<>();
            m.put("month",    ym.toString()); // "2026-01"
            m.put("signups",  signups);
            m.put("posts",    posts);
            m.put("visitors", visitors);
            result.add(m);
        }
        return result;
    }

    // ── Shared ───────────────────────────────────────────────────────────────

    public Map<String, Object> updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setAdminRole(role == null || role.isBlank() ? null : role);
        userRepository.save(user);
        return Map.of("success", true);
    }

    public Map<String, Object> updateUserStatus(Long userId, String newStatus,
                                                  String actorUsername, Long univId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        String oldStatus = user.getStatus();
        user.setStatus(newStatus);
        userRepository.save(user);
        logAction(actorUsername, statusToAction(oldStatus, newStatus), user.getUsername(),
                  oldStatus + " → " + newStatus, univId);
        return Map.of("success", true);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private long getAggregatedTodayVisitors(Long univId) {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        long count = pageVisitRepository.countByScopeTypeAndScopeIdAndVisitedAtAfter("univ", univId, todayStart);

        List<Long> facultyIds = getFacultyIds(univId);
        if (!facultyIds.isEmpty()) {
            count += pageVisitRepository.countByScopeTypeAndScopeIdInAndVisitedAtAfter("faculty", facultyIds, todayStart);
        }
        List<Long> deptIds = getDeptIds(facultyIds);
        if (!deptIds.isEmpty()) {
            count += pageVisitRepository.countByScopeTypeAndScopeIdInAndVisitedAtAfter("dept", deptIds, todayStart);
        }
        return count;
    }

    private List<Long> getFacultyIds(Long univId) {
        List<Long> schoolIds = collegeSchoolRepository.findByUniversityIdOrderByIdAsc(univId)
                .stream().map(s -> s.getId()).collect(Collectors.toList());
        if (schoolIds.isEmpty()) return Collections.emptyList();
        return schoolIds.stream()
                .flatMap(sid -> facultyGroupRepository.findBySchoolIdOrderByIdAsc(sid).stream())
                .map(f -> f.getId())
                .collect(Collectors.toList());
    }

    private List<Long> getDeptIds(List<Long> facultyIds) {
        if (facultyIds.isEmpty()) return Collections.emptyList();
        return facultyIds.stream()
                .flatMap(fid -> departmentRepository.findByFacultyIdOrderByIdAsc(fid).stream())
                .map(d -> d.getId())
                .collect(Collectors.toList());
    }

    private void logAction(String actor, String actionType, String target,
                            String detail, Long univId) {
        try {
            AdminLog log = new AdminLog();
            log.setActorUsername(actor);
            log.setActionType(actionType);
            log.setTargetUsername(target);
            log.setDetail(detail);
            log.setUniversityId(univId);
            log.setCreatedAt(LocalDateTime.now());
            adminLogRepository.save(log);
        } catch (Exception e) {
            System.out.println("[AdminLog] Failed to write log: " + e.getMessage());
        }
    }

    private String statusToAction(String oldStatus, String newStatus) {
        if ("ACTIVE".equals(newStatus) && "PENDING_APPROVAL".equals(oldStatus)) return "APPROVE";
        if ("DELETED".equals(newStatus) && "PENDING_APPROVAL".equals(oldStatus)) return "REJECT";
        if ("SUSPENDED".equals(newStatus)) return "SUSPEND";
        if ("ACTIVE".equals(newStatus) && "SUSPENDED".equals(oldStatus)) return "UNSUSPEND";
        if ("DELETED".equals(newStatus)) return "DELETE";
        return "STATUS_CHANGE";
    }

    private List<Map<String, Object>> aggregateByDay(List<PageVisit> visits) {
        Map<String, Long> byDay = new LinkedHashMap<>();
        for (int i = 29; i >= 0; i--) {
            byDay.put(LocalDate.now().minusDays(i).toString(), 0L);
        }
        for (PageVisit v : visits) {
            String date = v.getVisitedAt().toLocalDate().toString();
            byDay.merge(date, 1L, Long::sum);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        byDay.forEach((date, count) -> result.add(Map.of("date", date, "count", count)));
        return result;
    }

    // Backward compat: SuperAdminController still calls approveUser(id, boolean)
    public Map<String, Object> approveUser(Long userId, boolean approved) {
        return updateUserStatus(userId, approved ? "ACTIVE" : "PENDING_APPROVAL",
                                "system", null);
    }

    private Map<String, Object> toUserMap(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",           u.getId());
        m.put("username",     u.getUsername());
        m.put("name",         u.getName());
        m.put("memberType",   u.getMemberType());
        m.put("adminRole",    u.getAdminRole());
        m.put("status",       u.getStatus() != null ? u.getStatus() : "ACTIVE");
        // approved: derived from status for backward compat with SuperAdminPage
        m.put("approved",     "ACTIVE".equals(u.getStatus()));
        m.put("department",   u.getDepartment());
        m.put("universityId", u.getUniversityId());
        m.put("createdDate",  u.getCreatedDate() != null ? u.getCreatedDate().toString() : "");
        return m;
    }
}
```

- [x] **Step 2: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/service/AdminService.java
git commit -m "feat: AdminService — logAction, updateUserStatus, monthly stats, aggregated visitors"
```

---

## Task 6: SchoolAdminController — accept both roles + new endpoints

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java`

**Context:** Replace the single `verifySchoolAndGetUnivId(username)` helper (which only allows SCHOOL_ADMIN) with `resolveUnivId(username, univIdParam)` that accepts both SUPER_ADMIN and SCHOOL_ADMIN. SUPER_ADMIN must pass `?univId=X`; SCHOOL_ADMIN derives it from their profile. Add four new endpoints.

- [x] **Step 1: Replace SchoolAdminController.java entirely**

```java
package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AdminService;
import com.example.demo.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/school")
public class SchoolAdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final PostService postService;

    public SchoolAdminController(AdminService adminService,
                                  UserRepository userRepository,
                                  PostService postService) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.postService = postService;
    }

    // Accepts SUPER_ADMIN (passes univId param) or SCHOOL_ADMIN (univId from profile)
    private Long resolveUnivId(String username, Long univIdParam) {
        if (username == null || username.isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 없음"));
        String role = user.getAdminRole();
        if ("SUPER_ADMIN".equals(role)) {
            if (univIdParam == null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "univId 파라미터 필요");
            return univIdParam;
        }
        if ("SCHOOL_ADMIN".equals(role)) {
            if (user.getUniversityId() == null || user.getUniversityId().isBlank())
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학교 미연결");
            return Long.parseLong(user.getUniversityId());
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
    }

    // Returns the calling user's username (for log attribution)
    private String resolveActor(String username) {
        return username != null ? username : "unknown";
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolStats(id));
    }

    @GetMapping("/visitors")
    public ResponseEntity<List<Map<String, Object>>> getVisitors(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolVisitorTrend(id));
    }

    @GetMapping("/posts")
    public ResponseEntity<Map<String, Object>> getPosts(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolPosts(id, page));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long postId,
            @RequestParam(required = false) Long univId) {
        resolveUnivId(username, univId);
        postService.delete(postId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAdminUsers(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolAdminUsers(String.valueOf(id)));
    }

    @GetMapping("/all-users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolAllUsers(id));
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<Map<String, Object>>> getPendingUsers(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolPendingUsers(id));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) Long univId) {
        Long resolvedUnivId = resolveUnivId(username, univId);
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status 필드 필요");
        return ResponseEntity.ok(adminService.updateUserStatus(id, newStatus,
                resolveActor(username), resolvedUnivId));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, Object>>> getLogs(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getAdminLogs(id));
    }

    @GetMapping("/monthly-stats")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyStats(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(required = false) Long univId) {
        Long id = resolveUnivId(username, univId);
        return ResponseEntity.ok(adminService.getSchoolMonthlyStats(id));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateRole(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) Long univId) {
        resolveUnivId(username, univId);
        String role = body.get("role");
        if (role != null && !role.isBlank() && !"DEPT_ADMIN".equals(role))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "School Admin은 DEPT_ADMIN만 부여 가능");
        return ResponseEntity.ok(adminService.updateUserRole(id, role));
    }
}
```

- [x] **Step 2: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java
git commit -m "feat: SchoolAdminController accepts SUPER_ADMIN + SCHOOL_ADMIN, add new endpoints"
```

---

## Task 7: Frontend — fix ProtectedSchoolAdmin in App.tsx

**Files:**
- Modify: `frontend/src/App.tsx` line 64–68

- [x] **Step 1: Fix ProtectedSchoolAdmin to allow SUPER_ADMIN**

Change only lines 64–68 (the `ProtectedSchoolAdmin` function):

```tsx
function ProtectedSchoolAdmin({ children }: { children: ReactNode }) {
  const role = sessionStorage.getItem('adminRole')
  if (role !== 'SUPER_ADMIN' && role !== 'SCHOOL_ADMIN') return <Navigate to="/universities" replace />
  return <>{children}</>
}
```

- [x] **Step 2: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "fix: ProtectedSchoolAdmin allows SUPER_ADMIN to access school dashboard"
```

---

## Task 8: Frontend — update adminSchool.ts

**Files:**
- Modify: `frontend/src/api/adminSchool.ts`

**Context:** All existing fetch functions need an optional `univId?: number` parameter appended to the query string when present. Add new interfaces and functions for all-users, pending-users, status update, logs, monthly-stats.

- [x] **Step 1: Replace adminSchool.ts entirely**

```ts
const headers = (): HeadersInit => ({
  'Content-Type': 'application/json',
  'X-Username': sessionStorage.getItem('username') ?? '',
})

function handle403(res: Response) {
  if (res.status === 403) {
    window.location.href = '/universities'
    throw new Error('Forbidden')
  }
}

function univParam(univId?: number) {
  return univId != null ? `univId=${univId}` : ''
}

function qs(...parts: string[]) {
  const filtered = parts.filter(Boolean)
  return filtered.length ? '?' + filtered.join('&') : ''
}

export interface SchoolStats {
  totalPosts: number
  totalNotices: number
  todayVisitors: number
}

export interface VisitorPoint {
  date: string
  count: number
}

export interface PostItem {
  id: number
  title: string
  author: string
  category: string
  viewCount: number
  createdDate: string
}

export interface PostPage {
  posts: PostItem[]
  totalPages: number
  totalElements: number
}

export interface AdminUser {
  id: number
  username: string
  name: string
  memberType: string
  adminRole: string | null
  status: string
  department: string | null
  universityId: string | null
  createdDate: string
}

export interface AdminLog {
  id: number
  actionType: string
  actorUsername: string
  targetUsername: string | null
  detail: string | null
  createdAt: string
}

export interface MonthlyStats {
  month: string
  signups: number
  posts: number
  visitors: number
}

export async function fetchSchoolStats(univId?: number): Promise<SchoolStats> {
  const res = await fetch('/api/admin/school/stats' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolVisitors(univId?: number): Promise<VisitorPoint[]> {
  const res = await fetch('/api/admin/school/visitors' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolPosts(page: number, univId?: number): Promise<PostPage> {
  const res = await fetch('/api/admin/school/posts' + qs(`page=${page}`, univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function deleteSchoolPost(postId: number, univId?: number): Promise<void> {
  const res = await fetch('/api/admin/school/posts/' + postId + qs(univParam(univId)), {
    method: 'DELETE',
    headers: headers(),
  })
  handle403(res)
}

export async function fetchSchoolUsers(univId?: number): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/school/users' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolAllUsers(univId?: number): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/school/all-users' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolPendingUsers(univId?: number): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/school/pending-users' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function updateUserStatus(userId: number, status: string, univId?: number): Promise<void> {
  const res = await fetch('/api/admin/school/users/' + userId + '/status' + qs(univParam(univId)), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ status }),
  })
  handle403(res)
}

export async function updateSchoolUserRole(userId: number, role: string, univId?: number): Promise<void> {
  const res = await fetch('/api/admin/school/users/' + userId + '/role' + qs(univParam(univId)), {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ role }),
  })
  handle403(res)
}

export async function fetchAdminLogs(univId?: number): Promise<AdminLog[]> {
  const res = await fetch('/api/admin/school/logs' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolMonthlyStats(univId?: number): Promise<MonthlyStats[]> {
  const res = await fetch('/api/admin/school/monthly-stats' + qs(univParam(univId)), { headers: headers() })
  handle403(res)
  return res.json()
}
```

- [x] **Step 2: Commit**

```bash
git add frontend/src/api/adminSchool.ts
git commit -m "feat: adminSchool.ts — univId param, new interfaces + API functions"
```

---

## Task 9: Frontend — rewrite SchoolAdminPage with 6-tab layout

**Files:**
- Modify: `frontend/src/pages/admin/SchoolAdminPage.tsx`

**Context:** Full rewrite. 6 tabs: 개요 (charts), 게시글 관리, 전체 사용자, 가입 승인, 관리자 계정, 활동 로그. SUPER_ADMIN sees "감독 모드" badge and passes `univId` from `useParams()` to all API calls. Chart.js + react-chartjs-2 already installed. The `Bar` component needs `BarElement` registered.

- [x] **Step 1: Replace SchoolAdminPage.tsx entirely**

```tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import Navbar from '../../components/Navbar'
import {
  fetchSchoolStats, fetchSchoolVisitors, fetchSchoolPosts,
  deleteSchoolPost, fetchSchoolUsers, updateSchoolUserRole,
  fetchSchoolAllUsers, fetchSchoolPendingUsers, updateUserStatus,
  fetchAdminLogs, fetchSchoolMonthlyStats,
} from '../../api/adminSchool'
import type {
  SchoolStats, VisitorPoint, PostItem, AdminUser, AdminLog, MonthlyStats
} from '../../api/adminSchool'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
)

type Tab = '개요' | '게시글 관리' | '전체 사용자' | '가입 승인' | '관리자 계정' | '활동 로그'
const TABS: Tab[] = ['개요', '게시글 관리', '전체 사용자', '가입 승인', '관리자 계정', '활동 로그']

export default function SchoolAdminPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const adminRole = sessionStorage.getItem('adminRole')
  const isSuperAdmin = adminRole === 'SUPER_ADMIN'
  const univId = isSuperAdmin ? Number(id) : undefined

  const [tab, setTab]             = useState<Tab>('개요')
  const [stats, setStats]         = useState<SchoolStats | null>(null)
  const [visitors, setVisitors]   = useState<VisitorPoint[]>([])
  const [monthly, setMonthly]     = useState<MonthlyStats[]>([])
  const [posts, setPosts]         = useState<PostItem[]>([])
  const [allUsers, setAllUsers]   = useState<AdminUser[]>([])
  const [pending, setPending]     = useState<AdminUser[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [logs, setLogs]           = useState<AdminLog[]>([])
  const [page, setPage]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]     = useState(true)
  const [userFilter, setUserFilter] = useState<string>('전체')

  useEffect(() => {
    Promise.all([
      fetchSchoolStats(univId),
      fetchSchoolVisitors(univId),
      fetchSchoolMonthlyStats(univId),
      fetchSchoolAllUsers(univId),
      fetchSchoolPendingUsers(univId),
      fetchSchoolUsers(univId),
      fetchAdminLogs(univId),
    ]).then(([s, v, m, au, pu, admins, lg]) => {
      setStats(s); setVisitors(v); setMonthly(m)
      setAllUsers(au); setPending(pu); setAdminUsers(admins); setLogs(lg)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchSchoolPosts(page, univId).then(data => {
      setPosts(data.posts)
      setTotalPages(data.totalPages)
    })
  }, [page])

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return
    await deleteSchoolPost(postId, univId)
    fetchSchoolPosts(page, univId).then(d => { setPosts(d.posts); setTotalPages(d.totalPages) })
  }

  const handleStatusChange = async (userId: number, newStatus: string) => {
    if (newStatus === 'DELETED' && !window.confirm('삭제는 되돌릴 수 없습니다. 계속하시겠습니까?')) return
    await updateUserStatus(userId, newStatus, univId)
    const [au, pu] = await Promise.all([fetchSchoolAllUsers(univId), fetchSchoolPendingUsers(univId)])
    setAllUsers(au); setPending(pu)
    fetchAdminLogs(univId).then(setLogs)
  }

  const handleRoleChange = async (userId: number, currentRole: string | null) => {
    const newRole = currentRole === 'DEPT_ADMIN' ? '' : 'DEPT_ADMIN'
    await updateSchoolUserRole(userId, newRole, univId)
    fetchSchoolUsers(univId).then(setAdminUsers)
  }

  const filteredUsers = allUsers.filter(u => {
    if (userFilter === '학생') return u.memberType === 'student'
    if (userFilter === '교수') return u.memberType === 'professor'
    if (userFilter === '정지됨') return u.status === 'SUSPENDED'
    return true
  })

  const lineData = {
    labels: visitors.map(v => v.date.slice(5)),
    datasets: [{
      label: '방문자 수',
      data: visitors.map(v => v.count),
      borderColor: '#111827',
      backgroundColor: 'rgba(17,24,39,0.08)',
      fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#111827',
    }],
  }

  const doughnutData = {
    labels: ['게시글', '공지사항'],
    datasets: [{
      data: [stats?.totalPosts ?? 0, stats?.totalNotices ?? 0],
      backgroundColor: ['#111827', '#d1d5db'],
      borderWidth: 0,
    }],
  }

  const barData = {
    labels: monthly.map(m => m.month.slice(5) + '월'),
    datasets: [
      { label: '가입자', data: monthly.map(m => m.signups),  backgroundColor: '#111827' },
      { label: '게시글', data: monthly.map(m => m.posts),    backgroundColor: '#6b7280' },
      { label: '방문자', data: monthly.map(m => m.visitors), backgroundColor: '#d1d5db' },
    ],
  }

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f3f4f6' } } },
  }

  const barOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' as const, labels: { font: { size: 11 } } } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f3f4f6' } } },
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-400 text-sm">로딩 중...</p>
    </div>
  )

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <Navbar />
      <div className="pt-14" />

      {/* 헤더 */}
      <section className="bg-black text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">School Admin</p>
              <h1 className="text-2xl font-bold">학교 관리자 대시보드</h1>
              <p className="text-gray-400 text-sm mt-1">게시물 관리 및 사용자 관리</p>
            </div>
            {isSuperAdmin && (
              <span className="border border-yellow-400 text-yellow-400 text-xs px-3 py-1 ml-4">
                감독 모드
              </span>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-600 text-gray-300 px-4 py-2 text-xs hover:border-white hover:text-white transition"
          >
            <i className="fas fa-arrow-left mr-2" />돌아가기
          </button>
        </div>
      </section>

      {/* 탭 */}
      <div className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 flex gap-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium transition relative ${
                tab === t
                  ? 'border-b-2 border-black text-black -mb-px'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              {t === '가입 승인' && pending.length > 0
                ? `가입 승인 (${pending.length})`
                : t}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ── 개요 탭 ── */}
        {tab === '개요' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <StatCard icon="fa-file-alt" label="총 게시글"   value={stats?.totalPosts ?? 0} />
              <StatCard icon="fa-bullhorn" label="총 공지사항" value={stats?.totalNotices ?? 0} />
              <StatCard icon="fa-eye"      label="오늘 방문자" value={stats?.todayVisitors ?? 0} />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 border-2 border-black p-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">방문자 추이 (최근 30일)</h2>
                <Line data={lineData} options={lineOptions} />
              </div>
              <div className="border-2 border-black p-6 flex flex-col items-center justify-center">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">게시물 현황</h2>
                <div style={{ width: 200, height: 200 }}>
                  <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }} />
                </div>
              </div>
            </div>

            <div className="border-2 border-black p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">월별 현황 (최근 6개월)</h2>
              <Bar data={barData} options={barOptions} />
            </div>
          </>
        )}

        {/* ── 게시글 관리 탭 ── */}
        {tab === '게시글 관리' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">게시글 관리</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                    <th className="text-left pb-3 pr-4">제목</th>
                    <th className="text-left pb-3 pr-4">작성자</th>
                    <th className="text-left pb-3 pr-4">카테고리</th>
                    <th className="text-left pb-3 pr-4">조회수</th>
                    <th className="text-left pb-3 pr-4">작성일</th>
                    <th className="text-left pb-3">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p, i) => (
                    <tr key={p.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-3 pr-4 max-w-xs truncate">
                        <a href={`/post/${p.id}`} target="_blank" rel="noreferrer" className="hover:underline">{p.title}</a>
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{p.author}</td>
                      <td className="py-3 pr-4">
                        <span className="border border-gray-300 px-2 py-0.5 text-xs">{p.category}</span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{p.viewCount}</td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">{p.createdDate?.slice(0, 10)}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeletePost(p.id)}
                          className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition"
                        >삭제</button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">게시글이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex gap-1.5 mt-5 justify-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i} onClick={() => setPage(i)}
                    className={`w-8 h-8 text-xs border transition ${
                      page === i ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'
                    }`}
                  >{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 전체 사용자 탭 ── */}
        {tab === '전체 사용자' && (
          <div className="border-2 border-black p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">전체 사용자</h2>
              <select
                value={userFilter}
                onChange={e => setUserFilter(e.target.value)}
                className="border border-gray-300 text-sm px-3 py-1.5 focus:outline-none focus:border-black"
              >
                {['전체', '학생', '교수', '정지됨'].map(f => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                    <th className="text-left pb-3 pr-4">이름</th>
                    <th className="text-left pb-3 pr-4">아이디</th>
                    <th className="text-left pb-3 pr-4">유형</th>
                    <th className="text-left pb-3 pr-4">상태</th>
                    <th className="text-left pb-3">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-3 pr-4 font-medium">{u.name}</td>
                      <td className="py-3 pr-4 text-gray-500">{u.username}</td>
                      <td className="py-3 pr-4">
                        <span className="border border-gray-300 px-2 py-0.5 text-xs">{u.memberType}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="py-3 flex gap-2">
                        {u.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                            className="text-xs border border-orange-300 text-orange-500 px-3 py-1 hover:bg-orange-50 transition"
                          >정지</button>
                        )}
                        {u.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                            className="text-xs border border-green-400 text-green-600 px-3 py-1 hover:bg-green-50 transition"
                          >복구</button>
                        )}
                        {u.status !== 'DELETED' && (
                          <button
                            onClick={() => handleStatusChange(u.id, 'DELETED')}
                            className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition"
                          >삭제</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">사용자가 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 가입 승인 탭 ── */}
        {tab === '가입 승인' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">가입 승인 대기</h2>
            {pending.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">대기 중인 가입 요청이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                      <th className="text-left pb-3 pr-4">이름</th>
                      <th className="text-left pb-3 pr-4">아이디</th>
                      <th className="text-left pb-3 pr-4">유형</th>
                      <th className="text-left pb-3 pr-4">학과</th>
                      <th className="text-left pb-3 pr-4">가입일</th>
                      <th className="text-left pb-3">처리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((u, i) => (
                      <tr key={u.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                        <td className="py-3 pr-4 font-medium">{u.name}</td>
                        <td className="py-3 pr-4 text-gray-500">{u.username}</td>
                        <td className="py-3 pr-4">
                          <span className="border border-gray-300 px-2 py-0.5 text-xs">{u.memberType}</span>
                        </td>
                        <td className="py-3 pr-4 text-gray-500">{u.department ?? '-'}</td>
                        <td className="py-3 pr-4 text-gray-400 text-xs">{u.createdDate?.slice(0, 10)}</td>
                        <td className="py-3 flex gap-2">
                          <button
                            onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                            className="text-xs border border-green-400 text-green-600 px-3 py-1 hover:bg-green-50 transition"
                          >승인</button>
                          <button
                            onClick={() => handleStatusChange(u.id, 'DELETED')}
                            className="text-xs border border-red-300 text-red-500 px-3 py-1 hover:bg-red-50 transition"
                          >거절</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── 관리자 계정 탭 ── */}
        {tab === '관리자 계정' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">학과 관리자 계정 관리</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                    <th className="text-left pb-3 pr-4">이름</th>
                    <th className="text-left pb-3 pr-4">아이디</th>
                    <th className="text-left pb-3 pr-4">역할</th>
                    <th className="text-left pb-3 pr-4">상태</th>
                    <th className="text-left pb-3">역할 관리</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u, i) => (
                    <tr key={u.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-3 pr-4 font-medium">{u.name}</td>
                      <td className="py-3 pr-4 text-gray-500">{u.username}</td>
                      <td className="py-3 pr-4">
                        <span className="border border-gray-300 px-2 py-0.5 text-xs font-mono">
                          {u.adminRole ?? '없음'}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleRoleChange(u.id, u.adminRole)}
                          className="text-xs border border-gray-300 px-3 py-1 hover:border-black hover:bg-gray-50 transition"
                        >
                          {u.adminRole === 'DEPT_ADMIN' ? '역할 박탈' : 'DEPT_ADMIN 부여'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {adminUsers.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">관리자 계정이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 활동 로그 탭 ── */}
        {tab === '활동 로그' && (
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">관리자 활동 로그</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                    <th className="text-left pb-3 pr-4">액션</th>
                    <th className="text-left pb-3 pr-4">처리자</th>
                    <th className="text-left pb-3 pr-4">대상</th>
                    <th className="text-left pb-3 pr-4">내용</th>
                    <th className="text-left pb-3">시각</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                      <td className="py-3 pr-4">
                        <ActionBadge action={log.actionType} />
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{log.actorUsername}</td>
                      <td className="py-3 pr-4 text-gray-500">{log.targetUsername ?? '-'}</td>
                      <td className="py-3 pr-4 text-gray-400 text-xs max-w-xs truncate">{log.detail ?? '-'}</td>
                      <td className="py-3 text-gray-400 text-xs whitespace-nowrap">{relativeTime(log.createdAt)}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">활동 로그가 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="border-2 border-black p-5 hover:bg-gray-50 transition">
      <i className={`fas ${icon} text-xl text-gray-300 mb-3 block`} />
      <p className="text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE:           'border-green-400 text-green-600',
    PENDING_APPROVAL: 'border-amber-400 text-amber-500',
    SUSPENDED:        'border-orange-400 text-orange-500',
    DELETED:          'border-red-400 text-red-500',
  }
  const label: Record<string, string> = {
    ACTIVE: '활성', PENDING_APPROVAL: '승인대기', SUSPENDED: '정지됨', DELETED: '삭제됨',
  }
  const cls = map[status] ?? 'border-gray-300 text-gray-500'
  return (
    <span className={`border text-xs px-2 py-0.5 font-medium ${cls}`}>
      {label[status] ?? status}
    </span>
  )
}

function ActionBadge({ action }: { action: string }) {
  const map: Record<string, string> = {
    APPROVE:     'bg-green-100 text-green-700',
    REJECT:      'bg-red-100 text-red-700',
    SUSPEND:     'bg-orange-100 text-orange-700',
    UNSUSPEND:   'bg-blue-100 text-blue-700',
    DELETE:      'bg-red-100 text-red-700',
    ROLE_GRANT:  'bg-indigo-100 text-indigo-700',
    ROLE_REVOKE: 'bg-gray-100 text-gray-600',
  }
  const cls = map[action] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`text-xs px-2 py-0.5 font-mono font-medium ${cls}`}>{action}</span>
  )
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}시간 전`
  return `${Math.floor(hrs / 24)}일 전`
}
```

- [x] **Step 2: Commit**

```bash
git add frontend/src/pages/admin/SchoolAdminPage.tsx
git commit -m "feat: SchoolAdminPage 6-tab rewrite with user mgmt, approval queue, activity log"
```

---

## Task 10: Build frontend and copy static assets

**Files:**
- Modify: `demo/demo/src/main/resources/static/` (auto-generated)

- [x] **Step 1: Build frontend**

```bash
cd frontend && npm run build
```

Expected output: `dist/` directory created with `index.html` and `assets/`.

- [x] **Step 2: Copy build output to Spring Boot static**

On Windows PowerShell:
```powershell
Remove-Item -Recurse -Force ..\demo\demo\src\main\resources\static\assets
Copy-Item -Recurse .\dist\assets ..\demo\demo\src\main\resources\static\assets
Copy-Item .\dist\index.html ..\demo\demo\src\main\resources\static\index.html
```

On bash/Mac:
```bash
rm -rf ../demo/demo/src/main/resources/static/assets
cp -r dist/assets ../demo/demo/src/main/resources/static/assets
cp dist/index.html ../demo/demo/src/main/resources/static/index.html
```

- [x] **Step 3: Commit**

```bash
cd ..
git add demo/demo/src/main/resources/static/
git commit -m "build: update frontend static assets"
```

---

## Verification Checklist

After all tasks, manually verify:

1. **Routing bug:** Log in as superadmin → navigate to a university page → click "관리자 페이지" → should land on School Admin dashboard (not redirect to /universities)
2. **감독 모드 badge:** When SUPER_ADMIN views school dashboard, yellow "감독 모드" badge is visible in header
3. **개요 tab:** 3 stat cards show numbers, 30-day visitor line chart renders, doughnut and bar charts render
4. **전체 사용자 tab:** All school users listed; status badges show correct colors; 정지/복구/삭제 buttons work
5. **가입 승인 tab:** Shows pending count in tab label; empty state message when no pending users; 승인/거절 buttons update the list
6. **관리자 계정 tab:** Admin users listed with role toggle buttons
7. **활동 로그 tab:** Log entries appear after performing status/role changes
8. **Login check:** A PENDING_APPROVAL user cannot login (message: "관리자 승인 후 이용 가능합니다.")
9. **SCHOOL_ADMIN access:** schooladmin login still works and sees school dashboard without univId param
