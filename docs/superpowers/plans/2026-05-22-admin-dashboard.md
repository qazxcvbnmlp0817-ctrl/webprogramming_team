# Admin Dashboard RBAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement fully isolated Super Admin and School Admin dashboards with strict RBAC, real visitor tracking via PAGE_VISITS table, and Chart.js visualizations.

**Architecture:** Role-specific Spring controllers enforce server-side RBAC via `X-Username` header lookup; React route guards prevent cross-role access at the client; a `PAGE_VISITS` table + Spring `HandlerInterceptor` provides real visitor data; Chart.js renders 30-day trend lines and doughnut charts.

**Tech Stack:** Spring Boot (JPA, HandlerInterceptor), Oracle DB (Hibernate auto-DDL), React 18 + TypeScript, Tailwind CSS, Chart.js 4 + react-chartjs-2 5, Vite

---

## File Map

**Backend — New files:**
- `demo/demo/src/main/java/com/example/demo/entity/PageVisit.java`
- `demo/demo/src/main/java/com/example/demo/repository/PageVisitRepository.java`
- `demo/demo/src/main/java/com/example/demo/interceptor/VisitInterceptor.java`
- `demo/demo/src/main/java/com/example/demo/service/AdminService.java`
- `demo/demo/src/main/java/com/example/demo/controller/SuperAdminController.java`
- `demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java`

**Backend — Modified files:**
- `demo/demo/src/main/java/com/example/demo/entity/User.java` — add `createdDate`
- `demo/demo/src/main/java/com/example/demo/service/AuthService.java` — set createdDate on signup; return `universityId` on login
- `demo/demo/src/main/java/com/example/demo/repository/UserRepository.java` — add 3 admin queries
- `demo/demo/src/main/java/com/example/demo/repository/PostRepository.java` — add count + pageable variants
- `demo/demo/src/main/java/com/example/demo/repository/NoticeRepository.java` — add count query
- `demo/demo/src/main/java/com/example/demo/util/AdminUserInitializer.java` — wire universityId for seed accounts
- `demo/demo/src/main/java/com/example/demo/WebConfig.java` — register VisitInterceptor

**Frontend — New files:**
- `frontend/src/api/adminSuper.ts`
- `frontend/src/api/adminSchool.ts`

**Frontend — Modified files:**
- `frontend/src/App.tsx` — replace `ProtectedAdmin` with `ProtectedSuperAdmin` + `ProtectedSchoolAdmin`
- `frontend/src/pages/LoginPage.tsx` — save `universityId` to sessionStorage on login
- `frontend/src/pages/admin/SuperAdminPage.tsx` — full dashboard (replace stub)
- `frontend/src/pages/admin/SchoolAdminPage.tsx` — full dashboard (replace stub)

---

## Task 1: Add `createdDate` to User entity and AuthService

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/entity/User.java`
- Modify: `demo/demo/src/main/java/com/example/demo/service/AuthService.java`

- [ ] **Step 1: Add `createdDate` field to `User.java`**

Add the field and getter/setter after the `adminRole` field (line 35):

```java
// After: private String adminRole;
private java.time.LocalDateTime createdDate;

// After the existing getAdminRole/setAdminRole methods:
public java.time.LocalDateTime getCreatedDate() { return createdDate; }
public void setCreatedDate(java.time.LocalDateTime createdDate) { this.createdDate = createdDate; }
```

The full updated section of `User.java` (lines 35–63) becomes:

```java
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
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public String getAdminRole() { return adminRole; }
    public void setAdminRole(String adminRole) { this.adminRole = adminRole; }
    public java.time.LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(java.time.LocalDateTime createdDate) { this.createdDate = createdDate; }
```

- [ ] **Step 2: Set `createdDate` on signup in `AuthService.java`**

In the `signup` method, after `user.setApproved(...)` (line 87), add:

```java
        user.setApproved(!request.getMemberType().equals("admin"));
        user.setCreatedDate(java.time.LocalDateTime.now());
```

- [ ] **Step 3: Return `universityId` in login response in `AuthService.java`**

In the `login` method, after `response.put("adminRole", user.getAdminRole())` (line 63), add:

```java
        response.put("adminRole", user.getAdminRole());
        response.put("universityId", user.getUniversityId());
```

- [ ] **Step 4: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/entity/User.java
git add demo/demo/src/main/java/com/example/demo/service/AuthService.java
git commit -m "feat: add createdDate to User, return universityId on login"
```

---

## Task 2: PageVisit entity + repository

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/entity/PageVisit.java`
- Create: `demo/demo/src/main/java/com/example/demo/repository/PageVisitRepository.java`

- [ ] **Step 1: Create `PageVisit.java`**

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PAGE_VISITS")
public class PageVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String scopeType; // 'univ' | 'dept' | 'faculty'

    @Column(nullable = false)
    private Long scopeId;

    @Column(nullable = false)
    private LocalDateTime visitedAt;

    private String username; // null if anonymous

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getScopeType() { return scopeType; }
    public void setScopeType(String scopeType) { this.scopeType = scopeType; }
    public Long getScopeId() { return scopeId; }
    public void setScopeId(Long scopeId) { this.scopeId = scopeId; }
    public LocalDateTime getVisitedAt() { return visitedAt; }
    public void setVisitedAt(LocalDateTime visitedAt) { this.visitedAt = visitedAt; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}
```

- [ ] **Step 2: Create `PageVisitRepository.java`**

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
}
```

- [ ] **Step 3: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/entity/PageVisit.java
git add demo/demo/src/main/java/com/example/demo/repository/PageVisitRepository.java
git commit -m "feat: add PageVisit entity and repository for visitor tracking"
```

---

## Task 3: VisitInterceptor + WebConfig

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/interceptor/VisitInterceptor.java`
- Modify: `demo/demo/src/main/java/com/example/demo/WebConfig.java`

- [ ] **Step 1: Create `VisitInterceptor.java`**

Create the directory first: `demo/demo/src/main/java/com/example/demo/interceptor/`

```java
package com.example.demo.interceptor;

import com.example.demo.entity.PageVisit;
import com.example.demo.repository.PageVisitRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

@Component
public class VisitInterceptor implements HandlerInterceptor {

    private final PageVisitRepository pageVisitRepository;

    public VisitInterceptor(PageVisitRepository pageVisitRepository) {
        this.pageVisitRepository = pageVisitRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!"GET".equals(request.getMethod())) return true;

        String uri = request.getRequestURI();
        String scopeType = null;
        Long scopeId = null;

        try {
            if (uri.startsWith("/api/posts") || uri.startsWith("/api/notices")) {
                String raw = request.getParameter("deptId");
                if (raw != null) { scopeType = "dept"; scopeId = Long.parseLong(raw); }
            } else if (uri.startsWith("/api/univ/posts") || uri.startsWith("/api/univ/notices")) {
                String raw = request.getParameter("univId");
                if (raw != null) { scopeType = "univ"; scopeId = Long.parseLong(raw); }
            } else if (uri.startsWith("/api/faculty/posts") || uri.startsWith("/api/faculty/notices")) {
                String raw = request.getParameter("facultyId");
                if (raw != null) { scopeType = "faculty"; scopeId = Long.parseLong(raw); }
            }

            if (scopeType != null) {
                PageVisit visit = new PageVisit();
                visit.setScopeType(scopeType);
                visit.setScopeId(scopeId);
                visit.setVisitedAt(LocalDateTime.now());
                visit.setUsername(request.getHeader("X-Username"));
                pageVisitRepository.save(visit);
            }
        } catch (Exception ignored) {
            // never block user request on tracking failure
        }

        return true;
    }
}
```

- [ ] **Step 2: Update `WebConfig.java` to register the interceptor**

Replace the entire `WebConfig.java`:

```java
package com.example.demo;

import com.example.demo.interceptor.VisitInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    @Autowired
    private VisitInterceptor visitInterceptor;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Paths.get(uploadDir).toAbsolutePath().toUri().toString();
        if (!location.endsWith("/")) location += "/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(visitInterceptor)
                .addPathPatterns(
                    "/api/posts",
                    "/api/notices",
                    "/api/univ/posts",
                    "/api/univ/notices",
                    "/api/faculty/posts",
                    "/api/faculty/notices"
                );
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/interceptor/VisitInterceptor.java
git add demo/demo/src/main/java/com/example/demo/WebConfig.java
git commit -m "feat: add VisitInterceptor to track page visits in PAGE_VISITS"
```

---

## Task 4: Repository queries + AdminUserInitializer seed data

**Files:**
- Modify: `demo/demo/src/main/java/com/example/demo/repository/UserRepository.java`
- Modify: `demo/demo/src/main/java/com/example/demo/repository/PostRepository.java`
- Modify: `demo/demo/src/main/java/com/example/demo/repository/NoticeRepository.java`
- Modify: `demo/demo/src/main/java/com/example/demo/util/AdminUserInitializer.java`

- [ ] **Step 1: Update `UserRepository.java`**

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
}
```

- [ ] **Step 2: Update `PostRepository.java`**

Replace entire file:

```java
package com.example.demo.repository;

import com.example.demo.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByScopeTypeAndScopeIdOrderByCreatedDateDesc(String scopeType, Long scopeId);
    Page<Post> findByScopeTypeAndScopeId(String scopeType, Long scopeId, Pageable pageable);
    long countByScopeTypeAndScopeId(String scopeType, Long scopeId);
}
```

- [ ] **Step 3: Update `NoticeRepository.java`**

Replace entire file:

```java
package com.example.demo.repository;

import com.example.demo.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByScopeTypeAndScopeIdOrderByCreatedDateDesc(String scopeType, Long scopeId);
    long countByScopeTypeAndScopeId(String scopeType, Long scopeId);
}
```

- [ ] **Step 4: Update `AdminUserInitializer.java`** to wire universityId and fix existing accounts

Replace entire file:

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

        // Fix existing accounts that are missing universityId
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
        user.setApproved(true);
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

- [ ] **Step 5: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/repository/UserRepository.java
git add demo/demo/src/main/java/com/example/demo/repository/PostRepository.java
git add demo/demo/src/main/java/com/example/demo/repository/NoticeRepository.java
git add demo/demo/src/main/java/com/example/demo/util/AdminUserInitializer.java
git commit -m "feat: add admin queries to repositories, fix seed data universityId"
```

---

## Task 5: AdminService

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/service/AdminService.java`

- [ ] **Step 1: Create `AdminService.java`**

```java
package com.example.demo.service;

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
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PageVisitRepository pageVisitRepository;
    private final PostRepository postRepository;
    private final NoticeRepository noticeRepository;
    private final UniversityRepository universityRepository;

    public AdminService(UserRepository userRepository,
                        PageVisitRepository pageVisitRepository,
                        PostRepository postRepository,
                        NoticeRepository noticeRepository,
                        UniversityRepository universityRepository) {
        this.userRepository = userRepository;
        this.pageVisitRepository = pageVisitRepository;
        this.postRepository = postRepository;
        this.noticeRepository = noticeRepository;
        this.universityRepository = universityRepository;
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
                .findByVisitedAtAfter(LocalDateTime.now().minusDays(30));
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
        long todayVisitors = pageVisitRepository.countByScopeTypeAndScopeIdAndVisitedAtAfter(
                "univ", univId, LocalDate.now().atStartOfDay());

        Map<String, Object> result = new HashMap<>();
        result.put("totalPosts",    totalPosts);
        result.put("totalNotices",  totalNotices);
        result.put("todayVisitors", todayVisitors);
        return result;
    }

    public List<Map<String, Object>> getSchoolVisitorTrend(Long univId) {
        List<PageVisit> visits = pageVisitRepository
                .findByScopeTypeAndScopeIdAndVisitedAtAfter("univ", univId,
                        LocalDateTime.now().minusDays(30));
        return aggregateByDay(visits);
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

    // ── Shared ───────────────────────────────────────────────────────────────

    public Map<String, Object> updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setAdminRole(role == null || role.isBlank() ? null : role);
        userRepository.save(user);
        return Map.of("success", true);
    }

    public Map<String, Object> approveUser(Long userId, boolean approved) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setApproved(approved);
        userRepository.save(user);
        return Map.of("success", true);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

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

    private Map<String, Object> toUserMap(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",           u.getId());
        m.put("username",     u.getUsername());
        m.put("name",         u.getName());
        m.put("adminRole",    u.getAdminRole());
        m.put("approved",     u.isApproved());
        m.put("universityId", u.getUniversityId());
        return m;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/service/AdminService.java
git commit -m "feat: add AdminService with super/school admin business logic"
```

---

## Task 6: SuperAdminController

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/controller/SuperAdminController.java`

- [ ] **Step 1: Create `SuperAdminController.java`**

```java
package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UniversityRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/super")
public class SuperAdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final UniversityRepository universityRepository;

    public SuperAdminController(AdminService adminService,
                                 UserRepository userRepository,
                                 UniversityRepository universityRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.universityRepository = universityRepository;
    }

    private void verifySuper(String username) {
        if (username == null || username.isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 없음"));
        if (!"SUPER_ADMIN".equals(user.getAdminRole()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader(value = "X-Username", required = false) String username) {
        verifySuper(username);
        return ResponseEntity.ok(adminService.getSuperStats());
    }

    @GetMapping("/schools")
    public ResponseEntity<List<Map<String, Object>>> getSchools(
            @RequestHeader(value = "X-Username", required = false) String username) {
        verifySuper(username);
        List<Map<String, Object>> schools = universityRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id",          u.getId(),
                        "name",        u.getName(),
                        "description", u.getDescription() != null ? u.getDescription() : ""))
                .collect(Collectors.toList());
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/visitors")
    public ResponseEntity<List<Map<String, Object>>> getVisitors(
            @RequestHeader(value = "X-Username", required = false) String username) {
        verifySuper(username);
        return ResponseEntity.ok(adminService.getGlobalVisitorTrend());
    }

    @GetMapping("/infra")
    public ResponseEntity<Map<String, Object>> getInfra(
            @RequestHeader(value = "X-Username", required = false) String username) {
        verifySuper(username);
        return ResponseEntity.ok(adminService.getInfraStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @RequestHeader(value = "X-Username", required = false) String username) {
        verifySuper(username);
        return ResponseEntity.ok(adminService.getAllAdminUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateRole(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        verifySuper(username);
        return ResponseEntity.ok(adminService.updateUserRole(id, body.get("role")));
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveUser(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        verifySuper(username);
        Boolean approved = body.get("approved");
        if (approved == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "approved 필드 필요");
        return ResponseEntity.ok(adminService.approveUser(id, approved));
    }
}
```

- [ ] **Step 2: Verify backend compiles**

```bash
cd demo/demo && ./mvnw compile -q
```

Expected: BUILD SUCCESS (no errors)

- [ ] **Step 3: Start server and test the stats endpoint**

Start the backend, then:

```bash
curl -s -H "X-Username: superadmin" http://localhost:8080/api/admin/super/stats
```

Expected: `{"totalUsers":3,"newUsers7d":0,"newUsers30d":0,"totalSchools":1}` (values will vary)

```bash
curl -s -H "X-Username: schooladmin" http://localhost:8080/api/admin/super/stats
```

Expected: HTTP 403

- [ ] **Step 4: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/SuperAdminController.java
git commit -m "feat: add SuperAdminController with RBAC for /api/admin/super/**"
```

---

## Task 7: SchoolAdminController

**Files:**
- Create: `demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java`

- [ ] **Step 1: Create `SchoolAdminController.java`**

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

    private Long verifySchoolAndGetUnivId(String username) {
        if (username == null || username.isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 없음"));
        if (!"SCHOOL_ADMIN".equals(user.getAdminRole()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
        if (user.getUniversityId() == null || user.getUniversityId().isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "학교 미연결");
        return Long.parseLong(user.getUniversityId());
    }

    private User verifySchool(String username) {
        if (username == null || username.isBlank())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "인증 정보 없음");
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "사용자 없음"));
        if (!"SCHOOL_ADMIN".equals(user.getAdminRole()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한 없음");
        return user;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestHeader(value = "X-Username", required = false) String username) {
        Long univId = verifySchoolAndGetUnivId(username);
        return ResponseEntity.ok(adminService.getSchoolStats(univId));
    }

    @GetMapping("/visitors")
    public ResponseEntity<List<Map<String, Object>>> getVisitors(
            @RequestHeader(value = "X-Username", required = false) String username) {
        Long univId = verifySchoolAndGetUnivId(username);
        return ResponseEntity.ok(adminService.getSchoolVisitorTrend(univId));
    }

    @GetMapping("/posts")
    public ResponseEntity<Map<String, Object>> getPosts(
            @RequestHeader(value = "X-Username", required = false) String username,
            @RequestParam(defaultValue = "0") int page) {
        Long univId = verifySchoolAndGetUnivId(username);
        return ResponseEntity.ok(adminService.getSchoolPosts(univId, page));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Map<String, Object>> deletePost(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long postId) {
        verifySchoolAndGetUnivId(username);
        postService.delete(postId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @RequestHeader(value = "X-Username", required = false) String username) {
        User caller = verifySchool(username);
        return ResponseEntity.ok(adminService.getSchoolAdminUsers(caller.getUniversityId()));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, Object>> updateRole(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        verifySchoolAndGetUnivId(username);
        String role = body.get("role");
        if (role != null && !role.isBlank() && !"DEPT_ADMIN".equals(role))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "School Admin은 DEPT_ADMIN만 부여 가능");
        return ResponseEntity.ok(adminService.updateUserRole(id, role));
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveUser(
            @RequestHeader(value = "X-Username", required = false) String username,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        verifySchoolAndGetUnivId(username);
        Boolean approved = body.get("approved");
        if (approved == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "approved 필드 필요");
        return ResponseEntity.ok(adminService.approveUser(id, approved));
    }
}
```

- [ ] **Step 2: Verify backend compiles and test**

```bash
cd demo/demo && ./mvnw compile -q
```

Expected: BUILD SUCCESS

```bash
curl -s -H "X-Username: schooladmin" http://localhost:8080/api/admin/school/stats
```

Expected: `{"totalPosts":0,"totalNotices":0,"todayVisitors":0}` (or actual counts)

```bash
curl -s -H "X-Username: superadmin" http://localhost:8080/api/admin/school/stats
```

Expected: HTTP 403

- [ ] **Step 3: Commit**

```bash
git add demo/demo/src/main/java/com/example/demo/controller/SchoolAdminController.java
git commit -m "feat: add SchoolAdminController with RBAC for /api/admin/school/**"
```

---

## Task 8: Frontend Route Guards + LoginPage universityId

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/pages/LoginPage.tsx`

- [ ] **Step 1: Replace `ProtectedAdmin` in `App.tsx` with role-specific guards**

Replace the `ProtectedAdmin` function (lines 52–56):

```tsx
function ProtectedSuperAdmin({ children }: { children: ReactNode }) {
  const role = sessionStorage.getItem('adminRole')
  if (role !== 'SUPER_ADMIN') return <Navigate to="/universities" replace />
  return <>{children}</>
}

function ProtectedSchoolAdmin({ children }: { children: ReactNode }) {
  const role = sessionStorage.getItem('adminRole')
  if (role !== 'SCHOOL_ADMIN') return <Navigate to="/universities" replace />
  return <>{children}</>
}
```

Then update the admin routes (lines 113–116) to use the new guards:

```tsx
          {/* 어드민 페이지 */}
          <Route path="/admin/super"      element={<ProtectedSuperAdmin><SuperAdminPage /></ProtectedSuperAdmin>} />
          <Route path="/admin/school/:id" element={<ProtectedSchoolAdmin><SchoolAdminPage /></ProtectedSchoolAdmin>} />
          <Route path="/admin/dept/:id"   element={<ProtectedAdmin><DeptAdminPage /></ProtectedAdmin>} />
```

Keep the old `ProtectedAdmin` for the Dept admin route:

```tsx
function ProtectedAdmin({ children }: { children: ReactNode }) {
  const role = sessionStorage.getItem('adminRole')
  if (!role) return <Navigate to="/universities" replace />
  return <>{children}</>
}
```

- [ ] **Step 2: Save `universityId` to sessionStorage on login in `LoginPage.tsx`**

In `LoginPage.tsx`, inside the `if (result.success)` block, after the `adminRole` line (line 34), add:

```tsx
        sessionStorage.setItem('adminRole', result.adminRole ?? '')
        sessionStorage.setItem('universityId', result.universityId ?? '')
```

(Replace the existing `sessionStorage.setItem('adminRole', result.adminRole ?? '')` with both lines.)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx frontend/src/pages/LoginPage.tsx
git commit -m "feat: separate ProtectedSuperAdmin/ProtectedSchoolAdmin route guards, save universityId"
```

---

## Task 9: Frontend API files

**Files:**
- Create: `frontend/src/api/adminSuper.ts`
- Create: `frontend/src/api/adminSchool.ts`

- [ ] **Step 1: Create `adminSuper.ts`**

```typescript
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

export interface SuperStats {
  totalUsers: number
  newUsers7d: number
  newUsers30d: number
  totalSchools: number
}

export interface School {
  id: number
  name: string
  description: string
}

export interface VisitorPoint {
  date: string
  count: number
}

export interface InfraStats {
  usedMemoryMB: number
  maxMemoryMB: number
  activeThreads: number
  uptimeHours: number
  uptimeMinutes: number
}

export interface AdminUser {
  id: number
  username: string
  name: string
  adminRole: string | null
  approved: boolean
  universityId: string | null
}

export async function fetchSuperStats(): Promise<SuperStats> {
  const res = await fetch('/api/admin/super/stats', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSuperSchools(): Promise<School[]> {
  const res = await fetch('/api/admin/super/schools', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSuperVisitors(): Promise<VisitorPoint[]> {
  const res = await fetch('/api/admin/super/visitors', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSuperInfra(): Promise<InfraStats> {
  const res = await fetch('/api/admin/super/infra', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSuperUsers(): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/super/users', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function updateUserRole(userId: number, role: string): Promise<void> {
  const res = await fetch(`/api/admin/super/users/${userId}/role`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ role }),
  })
  handle403(res)
}

export async function approveUser(userId: number, approved: boolean): Promise<void> {
  const res = await fetch(`/api/admin/super/users/${userId}/approve`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ approved }),
  })
  handle403(res)
}
```

- [ ] **Step 2: Create `adminSchool.ts`**

```typescript
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
  adminRole: string | null
  approved: boolean
}

export async function fetchSchoolStats(): Promise<SchoolStats> {
  const res = await fetch('/api/admin/school/stats', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolVisitors(): Promise<VisitorPoint[]> {
  const res = await fetch('/api/admin/school/visitors', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function fetchSchoolPosts(page: number): Promise<PostPage> {
  const res = await fetch(`/api/admin/school/posts?page=${page}`, { headers: headers() })
  handle403(res)
  return res.json()
}

export async function deleteSchoolPost(postId: number): Promise<void> {
  const res = await fetch(`/api/admin/school/posts/${postId}`, {
    method: 'DELETE',
    headers: headers(),
  })
  handle403(res)
}

export async function fetchSchoolUsers(): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/school/users', { headers: headers() })
  handle403(res)
  return res.json()
}

export async function updateSchoolUserRole(userId: number, role: string): Promise<void> {
  const res = await fetch(`/api/admin/school/users/${userId}/role`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ role }),
  })
  handle403(res)
}

export async function approveSchoolUser(userId: number, approved: boolean): Promise<void> {
  const res = await fetch(`/api/admin/school/users/${userId}/approve`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ approved }),
  })
  handle403(res)
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/adminSuper.ts frontend/src/api/adminSchool.ts
git commit -m "feat: add adminSuper and adminSchool API client functions"
```

---

## Task 10: Install Chart.js

**Files:**
- Modify: `frontend/package.json` (via npm install)

- [ ] **Step 1: Install dependencies**

```bash
cd frontend && npm install chart.js react-chartjs-2
```

Expected: packages added successfully, no peer-dep errors.

- [ ] **Step 2: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add chart.js and react-chartjs-2"
```

---

## Task 11: SuperAdminPage

**Files:**
- Modify: `frontend/src/pages/admin/SuperAdminPage.tsx`

- [ ] **Step 1: Replace `SuperAdminPage.tsx` with full dashboard**

```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import Navbar from '../../components/Navbar'
import {
  fetchSuperStats, fetchSuperSchools, fetchSuperVisitors,
  fetchSuperInfra, fetchSuperUsers, updateUserRole, approveUser
} from '../../api/adminSuper'
import type { SuperStats, School, VisitorPoint, InfraStats, AdminUser } from '../../api/adminSuper'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

export default function SuperAdminPage() {
  const navigate = useNavigate()
  const [stats, setStats]     = useState<SuperStats | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [visitors, setVisitors] = useState<VisitorPoint[]>([])
  const [infra, setInfra]     = useState<InfraStats | null>(null)
  const [users, setUsers]     = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const loadAll = () =>
    Promise.all([
      fetchSuperStats(),
      fetchSuperSchools(),
      fetchSuperVisitors(),
      fetchSuperInfra(),
      fetchSuperUsers(),
    ]).then(([s, sch, v, i, u]) => {
      setStats(s); setSchools(sch); setVisitors(v); setInfra(i); setUsers(u)
      setLoading(false)
    }).catch(() => setLoading(false))

  useEffect(() => { loadAll() }, [])

  const handleRoleChange = async (userId: number, role: string) => {
    await updateUserRole(userId, role)
    const updated = await fetchSuperUsers()
    setUsers(updated)
  }

  const handleApprove = async (userId: number, approved: boolean) => {
    await approveUser(userId, approved)
    const updated = await fetchSuperUsers()
    setUsers(updated)
  }

  const visitorLineData = {
    labels: visitors.map(v => v.date.slice(5)),
    datasets: [{
      label: '방문자 수',
      data: visitors.map(v => v.count),
      borderColor: '#111827',
      backgroundColor: 'rgba(17,24,39,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#111827',
    }],
  }

  const userBarData = {
    labels: ['7일 신규', '30일 신규', '전체'],
    datasets: [{
      label: '사용자',
      data: [stats?.newUsers7d ?? 0, stats?.newUsers30d ?? 0, stats?.totalUsers ?? 0],
      backgroundColor: ['#111827', '#4b5563', '#9ca3af'],
      borderWidth: 0,
    }],
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
    },
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
          <div>
            <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">Super Admin</p>
            <h1 className="text-2xl font-bold">최고 관리자 대시보드</h1>
            <p className="text-gray-400 text-sm mt-1">서버 전체 현황 및 관리자 권한 관리</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-600 text-gray-300 px-4 py-2 text-xs hover:border-white hover:text-white transition"
          >
            <i className="fas fa-arrow-left mr-2" />돌아가기
          </button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="fa-users" label="총 사용자" value={stats?.totalUsers ?? 0} />
          <StatCard icon="fa-user-plus" label="신규 가입 (7일)" value={stats?.newUsers7d ?? 0} />
          <StatCard icon="fa-calendar-alt" label="신규 가입 (30일)" value={stats?.newUsers30d ?? 0} />
          <StatCard icon="fa-university" label="등록 학교" value={stats?.totalSchools ?? 0} />
        </div>

        {/* 차트 영역 */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">방문자 추이 (최근 30일)</h2>
            <Line data={visitorLineData} options={chartOptions} />
          </div>
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">사용자 현황</h2>
            <Bar data={userBarData} options={chartOptions} />
          </div>
        </div>

        {/* 학교 목록 + 인프라 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">등록 학교 목록</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {schools.length === 0 && <p className="text-sm text-gray-400">등록된 학교가 없습니다.</p>}
              {schools.map(s => (
                <div key={s.id} className="flex items-center justify-between border border-gray-200 px-4 py-2.5 hover:bg-gray-50">
                  <span className="text-sm font-medium">{s.name}</span>
                  <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5">ID {s.id}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">서버 인프라 현황</h2>
            {infra && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">메모리 사용량</span>
                    <span className="font-medium">{infra.usedMemoryMB}MB / {infra.maxMemoryMB}MB</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5">
                    <div
                      className="bg-black h-2.5 transition-all"
                      style={{ width: `${Math.min(100, Math.round((infra.usedMemoryMB / infra.maxMemoryMB) * 100))}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {Math.round((infra.usedMemoryMB / infra.maxMemoryMB) * 100)}% 사용 중
                  </p>
                </div>
                <InfraRow label="활성 스레드" value={`${infra.activeThreads}개`} />
                <InfraRow label="서버 업타임" value={`${infra.uptimeHours}시간 ${infra.uptimeMinutes}분`} />
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  <span className="text-xs text-gray-500">서버 정상 운영 중</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 관리자 계정 관리 */}
        <div className="border-2 border-black p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">관리자 계정 관리</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-black text-xs uppercase tracking-wide text-gray-500">
                  <th className="text-left pb-3 pr-4">이름</th>
                  <th className="text-left pb-3 pr-4">아이디</th>
                  <th className="text-left pb-3 pr-4">역할</th>
                  <th className="text-left pb-3 pr-4">학교 ID</th>
                  <th className="text-left pb-3 pr-4">상태</th>
                  <th className="text-left pb-3 pr-4">역할 변경</th>
                  <th className="text-left pb-3">승인 관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-3 pr-4 font-medium">{u.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{u.username}</td>
                    <td className="py-3 pr-4">
                      <span className="border border-gray-300 px-2 py-0.5 text-xs font-mono">
                        {u.adminRole ?? '없음'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{u.universityId ?? '-'}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-bold ${u.approved ? 'text-green-600' : 'text-amber-500'}`}>
                        {u.approved ? '승인됨' : '대기 중'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={u.adminRole ?? ''}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="border border-gray-300 text-xs px-2 py-1 bg-white"
                      >
                        <option value="">없음</option>
                        <option value="SCHOOL_ADMIN">SCHOOL_ADMIN</option>
                        <option value="DEPT_ADMIN">DEPT_ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleApprove(u.id, !u.approved)}
                        className={`text-xs border px-3 py-1 transition ${
                          u.approved
                            ? 'border-red-300 text-red-500 hover:bg-red-50'
                            : 'border-green-400 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {u.approved ? '승인 취소' : '승인'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">관리자 계정이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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

function InfraRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-100">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/admin/SuperAdminPage.tsx
git commit -m "feat: implement SuperAdminPage dashboard with charts and role management"
```

---

## Task 12: SchoolAdminPage

**Files:**
- Modify: `frontend/src/pages/admin/SchoolAdminPage.tsx`

- [ ] **Step 1: Replace `SchoolAdminPage.tsx` with full dashboard**

```tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import Navbar from '../../components/Navbar'
import {
  fetchSchoolStats, fetchSchoolVisitors, fetchSchoolPosts,
  deleteSchoolPost, fetchSchoolUsers, updateSchoolUserRole, approveSchoolUser
} from '../../api/adminSchool'
import type { SchoolStats, VisitorPoint, PostItem, AdminUser } from '../../api/adminSchool'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

export default function SchoolAdminPage() {
  const navigate = useNavigate()
  const [stats, setStats]       = useState<SchoolStats | null>(null)
  const [visitors, setVisitors] = useState<VisitorPoint[]>([])
  const [posts, setPosts]       = useState<PostItem[]>([])
  const [users, setUsers]       = useState<AdminUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    Promise.all([
      fetchSchoolStats(),
      fetchSchoolVisitors(),
      fetchSchoolUsers(),
    ]).then(([s, v, u]) => {
      setStats(s); setVisitors(v); setUsers(u)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchSchoolPosts(page).then(data => {
      setPosts(data.posts)
      setTotalPages(data.totalPages)
    })
  }, [page])

  const handleDelete = async (postId: number) => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return
    await deleteSchoolPost(postId)
    fetchSchoolPosts(page).then(data => { setPosts(data.posts); setTotalPages(data.totalPages) })
  }

  const handleRoleChange = async (userId: number, currentRole: string | null) => {
    const newRole = currentRole === 'DEPT_ADMIN' ? '' : 'DEPT_ADMIN'
    await updateSchoolUserRole(userId, newRole)
    fetchSchoolUsers().then(setUsers)
  }

  const handleApprove = async (userId: number, approved: boolean) => {
    await approveSchoolUser(userId, !approved)
    fetchSchoolUsers().then(setUsers)
  }

  const lineData = {
    labels: visitors.map(v => v.date.slice(5)),
    datasets: [{
      label: '방문자 수',
      data: visitors.map(v => v.count),
      borderColor: '#111827',
      backgroundColor: 'rgba(17,24,39,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#111827',
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

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
    },
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
          <div>
            <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">School Admin</p>
            <h1 className="text-2xl font-bold">학교 관리자 대시보드</h1>
            <p className="text-gray-400 text-sm mt-1">게시물 관리 및 학과 관리자 권한 관리</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-600 text-gray-300 px-4 py-2 text-xs hover:border-white hover:text-white transition"
          >
            <i className="fas fa-arrow-left mr-2" />돌아가기
          </button>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon="fa-file-alt"  label="총 게시글"    value={stats?.totalPosts ?? 0} />
          <StatCard icon="fa-bullhorn"  label="총 공지사항"  value={stats?.totalNotices ?? 0} />
          <StatCard icon="fa-eye"       label="오늘 방문자"  value={stats?.todayVisitors ?? 0} />
        </div>

        {/* 차트 영역 */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border-2 border-black p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">방문자 추이 (최근 30일)</h2>
            <Line data={lineData} options={lineOptions} />
          </div>
          <div className="border-2 border-black p-6 flex flex-col items-center justify-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">게시물 현황</h2>
            <div style={{ width: 200, height: 200 }}>
              <Doughnut
                data={doughnutData}
                options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }}
              />
            </div>
          </div>
        </div>

        {/* 게시글 관리 */}
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
                      <a href={`/post/${p.id}`} target="_blank" rel="noreferrer"
                         className="hover:underline">{p.title}</a>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{p.author}</td>
                    <td className="py-3 pr-4">
                      <span className="border border-gray-300 px-2 py-0.5 text-xs">{p.category}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{p.viewCount}</td>
                    <td className="py-3 pr-4 text-gray-400 text-xs">{p.createdDate?.slice(0, 10)}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(p.id)}
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

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex gap-1.5 mt-5 justify-center">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 text-xs border transition ${
                    page === i ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 학과 관리자 계정 관리 */}
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
                  <th className="text-left pb-3 pr-4">역할 관리</th>
                  <th className="text-left pb-3">승인 관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-3 pr-4 font-medium">{u.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{u.username}</td>
                    <td className="py-3 pr-4">
                      <span className="border border-gray-300 px-2 py-0.5 text-xs font-mono">
                        {u.adminRole ?? '없음'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-bold ${u.approved ? 'text-green-600' : 'text-amber-500'}`}>
                        {u.approved ? '승인됨' : '대기 중'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => handleRoleChange(u.id, u.adminRole)}
                        className="text-xs border border-gray-300 px-3 py-1 hover:border-black hover:bg-gray-50 transition"
                      >
                        {u.adminRole === 'DEPT_ADMIN' ? '역할 박탈' : 'DEPT_ADMIN 부여'}
                      </button>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleApprove(u.id, u.approved)}
                        className={`text-xs border px-3 py-1 transition ${
                          u.approved
                            ? 'border-red-300 text-red-500 hover:bg-red-50'
                            : 'border-green-400 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {u.approved ? '승인 취소' : '승인'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">관리자 계정이 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
```

- [ ] **Step 2: Verify frontend builds without errors**

```bash
cd frontend && npm run build 2>&1 | tail -20
```

Expected: `✓ built in` (no TypeScript or build errors)

- [ ] **Step 3: End-to-end smoke test**

1. Start backend: `cd demo/demo && ./mvnw spring-boot:run`
2. Start frontend dev server: `cd frontend && npm run dev`
3. Login as `superadmin` / `admin1234` (관리자 선택)
4. Navigate to any school page → click "관리자 페이지" banner → should reach `/admin/super`
5. Verify: 4 stat cards show, visitor chart renders, schools list appears, infra stats appear
6. Try navigating to `/admin/school/1` while logged in as superadmin → should redirect to `/universities`
7. Login as `schooladmin` / `admin1234`
8. Navigate to `/admin/school/1` → should reach School Admin dashboard
9. Try navigating to `/admin/super` while logged in as schooladmin → should redirect to `/universities`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/admin/SchoolAdminPage.tsx
git commit -m "feat: implement SchoolAdminPage dashboard with charts, post management, role management"
```
