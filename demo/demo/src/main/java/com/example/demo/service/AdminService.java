package com.example.demo.service;

import com.example.demo.entity.AdminLog;
import com.example.demo.entity.CollegeSchool;
import com.example.demo.entity.CurriculumItem;
import com.example.demo.entity.Department;
import com.example.demo.entity.Notice;
import com.example.demo.entity.PageVisit;
import com.example.demo.entity.Post;
import com.example.demo.entity.Professor;
import com.example.demo.entity.ProfessorCourseAssignment;
import com.example.demo.entity.User;
import com.example.demo.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
    private final ProfessorRepository professorRepository;
    private final CurriculumItemRepository curriculumItemRepository;
    private final ProfessorCourseAssignmentRepository assignmentRepository;

    public AdminService(UserRepository userRepository,
                        PageVisitRepository pageVisitRepository,
                        PostRepository postRepository,
                        NoticeRepository noticeRepository,
                        UniversityRepository universityRepository,
                        CollegeSchoolRepository collegeSchoolRepository,
                        FacultyGroupRepository facultyGroupRepository,
                        DepartmentRepository departmentRepository,
                        AdminLogRepository adminLogRepository,
                        ProfessorRepository professorRepository,
                        CurriculumItemRepository curriculumItemRepository,
                        ProfessorCourseAssignmentRepository assignmentRepository) {
        this.userRepository = userRepository;
        this.pageVisitRepository = pageVisitRepository;
        this.postRepository = postRepository;
        this.noticeRepository = noticeRepository;
        this.universityRepository = universityRepository;
        this.collegeSchoolRepository = collegeSchoolRepository;
        this.facultyGroupRepository = facultyGroupRepository;
        this.departmentRepository = departmentRepository;
        this.adminLogRepository = adminLogRepository;
        this.professorRepository = professorRepository;
        this.curriculumItemRepository = curriculumItemRepository;
        this.assignmentRepository = assignmentRepository;
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

    public Map<String, Object> deleteSchoolPost(Long postId, Long univId, String actor) {
        Post p = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));
        if (!"univ".equals(p.getScopeType()) || !univId.equals(p.getScopeId())) {
            throw new RuntimeException("Post scope mismatch");
        }
        postRepository.deleteById(postId);
        logAction(actor, "DELETE", null, "univ post#" + postId, univId);
        return Map.of("success", true);
    }

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
        return getScopedPosts("univ", univId, page);
    }

    public Map<String, Object> getScopedPosts(String scopeType, Long scopeId, int page) {
        Page<Post> postPage = postRepository.findByScopeTypeAndScopeId(
                scopeType, scopeId,
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

    public Map<String, Object> getScopedNotices(String scopeType, Long scopeId, int page) {
        Page<Notice> nPage = noticeRepository.findByScopeTypeAndScopeId(
                scopeType, scopeId,
                PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "createdDate")));

        List<Map<String, Object>> notices = nPage.getContent().stream().map(n -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id",          n.getId());
            m.put("title",       n.getTitle());
            m.put("author",      n.getAuthor());
            m.put("category",    n.getCategory());
            m.put("viewCount",   n.getViewCount());
            m.put("featured",    n.isFeatured());
            m.put("createdDate", n.getCreatedDate() != null ? n.getCreatedDate().toString() : "");
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("notices",       notices);
        result.put("totalPages",    nPage.getTotalPages());
        result.put("totalElements", nPage.getTotalElements());
        return result;
    }

    public List<Map<String, Object>> getSchoolAdminUsers(String universityId) {
        return userRepository.findByUniversityIdAndAdminRoleIsNotNull(universityId)
                .stream().map(this::toUserMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getSchoolAllUsers(Long univId) {
        return userRepository.findByUniversityId(String.valueOf(univId))
                .stream().map(this::toUserMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getSchoolPendingUsers(Long univId) {
        // Exclude admin signups — those are routed to SUPER_ADMIN for role assignment.
        return userRepository.findByUniversityIdAndStatusAndMemberTypeNot(
                        String.valueOf(univId), "PENDING_APPROVAL", "admin")
                .stream().map(this::toUserMap).collect(Collectors.toList());
    }

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
            m.put("month",    ym.toString());
            m.put("signups",  signups);
            m.put("posts",    posts);
            m.put("visitors", visitors);
            result.add(m);
        }
        return result;
    }

    // ── Shared ───────────────────────────────────────────────────────────────

    public Map<String, Object> updateUserRole(Long userId, String role,
                                               String actor, Long univId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        String oldRole = user.getAdminRole();
        boolean grant = role != null && !role.isBlank();

        if (grant) {
            if (roleLevel(oldRole) > roleLevel(role)) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "이미 상위 역할(" + oldRole + ")을 보유하고 있습니다. 먼저 현재 역할을 박탈하세요.");
            }
            user.setAdminRole(role);
        } else {
            if ("admin".equals(user.getMemberType())) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "admin 계정은 최소 1개의 역할이 필요합니다.");
            }
            user.setAdminRole(null);
        }
        userRepository.save(user);
        logAction(actor,
                  grant ? "ROLE_GRANT" : "ROLE_REVOKE",
                  user.getUsername(),
                  grant ? "역할 부여: " + role : "역할 박탈 (이전: " + oldRole + ")",
                  univId);
        return Map.of("success", true);
    }

    private int roleLevel(String role) {
        if ("SUPER_ADMIN".equals(role)) return 3;
        if ("SCHOOL_ADMIN".equals(role)) return 2;
        if ("DEPT_ADMIN".equals(role)) return 1;
        return 0;
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

    public Map<String, Object> approveUser(Long userId, boolean approved, String actor) {
        return updateUserStatus(userId, approved ? "ACTIVE" : "PENDING_APPROVAL",
                                actor, null);
    }

    // ── Super admin: pending admin signups ───────────────────────────────────

    public List<Map<String, Object>> getPendingAdmins() {
        return userRepository.findByStatusAndMemberType("PENDING_APPROVAL", "admin")
                .stream().map(this::toUserMap).collect(Collectors.toList());
    }

    /**
     * approve=true  → status=ACTIVE; adminRole set when {@code role} non-blank.
     * approve=false → status=DELETED (rejection; user can no longer log in).
     */
    public Map<String, Object> approveAdmin(Long userId, boolean approve,
                                              String role, String actorUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        if (approve) {
            user.setStatus("ACTIVE");
            if (role != null && !role.isBlank()) {
                user.setAdminRole(role);
            }
            userRepository.save(user);
            Long univ = parseUnivId(user.getUniversityId());
            logAction(actorUsername, "APPROVE", user.getUsername(),
                      role != null && !role.isBlank()
                          ? "관리자 가입 승인 (role=" + role + ")"
                          : "관리자 가입 승인 (역할 미지정)",
                      univ);
        } else {
            user.setStatus("DELETED");
            userRepository.save(user);
            Long univ = parseUnivId(user.getUniversityId());
            logAction(actorUsername, "REJECT", user.getUsername(),
                      "관리자 가입 거절", univ);
        }
        return Map.of("success", true);
    }

    private Long parseUnivId(String s) {
        if (s == null || s.isBlank()) return null;
        try { return Long.parseLong(s); } catch (NumberFormatException e) { return null; }
    }

    // ── Dept Admin ───────────────────────────────────────────────────────────

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
        return aggregateByDay(visits);
    }

    public Map<String, Object> getDeptPosts(Long deptId, int page) {
        return getScopedPosts("dept", deptId, page);
    }

    public Map<String, Object> deleteDeptPost(Long postId, Long deptId, String actor) {
        Post p = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));
        if (!"dept".equals(p.getScopeType()) || !deptId.equals(p.getScopeId())) {
            throw new RuntimeException("Post scope mismatch");
        }
        postRepository.deleteById(postId);
        logAction(actor, "DELETE", null, "dept post#" + postId, deptToUnivId(deptId));
        return Map.of("success", true);
    }

    public Map<String, Object> getDeptNotices(Long deptId, int page) {
        return getScopedNotices("dept", deptId, page);
    }

    public Map<String, Object> deleteDeptNotice(Long noticeId, Long deptId, String actor) {
        Notice n = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found: " + noticeId));
        if (!"dept".equals(n.getScopeType()) || !deptId.equals(n.getScopeId())) {
            throw new RuntimeException("Notice scope mismatch");
        }
        noticeRepository.deleteById(noticeId);
        logAction(actor, "DELETE", null, "dept notice#" + noticeId, deptToUnivId(deptId));
        return Map.of("success", true);
    }

    public List<Map<String, Object>> getDeptUsers(Long deptId) {
        Department d = departmentRepository.findById(deptId)
                .orElseThrow(() -> new RuntimeException("Department not found: " + deptId));
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

    public Long deptToUnivId(Long deptId) {
        return departmentRepository.findById(deptId)
                .flatMap(d -> facultyGroupRepository.findById(d.getFacultyId()))
                .flatMap(f -> collegeSchoolRepository.findById(f.getSchoolId()))
                .map(CollegeSchool::getUniversityId)
                .orElse(null);
    }

    // ── Faculty Admin ────────────────────────────────────────────────────────

    public Map<String, Object> getFacultyStats(Long facultyId) {
        long totalPosts   = postRepository.countByScopeTypeAndScopeId("faculty", facultyId);
        long totalNotices = noticeRepository.countByScopeTypeAndScopeId("faculty", facultyId);
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        long todayVisitors = pageVisitRepository
            .countByScopeTypeAndScopeIdAndVisitedAtAfter("faculty", facultyId, todayStart);
        Map<String, Object> result = new HashMap<>();
        result.put("totalPosts", totalPosts);
        result.put("totalNotices", totalNotices);
        result.put("todayVisitors", todayVisitors);
        return result;
    }

    public List<Map<String, Object>> getFacultyVisitorTrend(Long facultyId) {
        LocalDateTime since = LocalDate.now().minusDays(29).atStartOfDay();
        List<PageVisit> visits = pageVisitRepository
            .findByScopeTypeAndScopeIdAndVisitedAtAfter("faculty", facultyId, since);
        return aggregateByDay(visits);
    }

    public Map<String, Object> getFacultyPosts(Long facultyId, int page) {
        return getScopedPosts("faculty", facultyId, page);
    }

    public Map<String, Object> deleteFacultyPost(Long postId, Long facultyId, String actor) {
        Post p = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));
        if (!"faculty".equals(p.getScopeType()) || !facultyId.equals(p.getScopeId())) {
            throw new RuntimeException("Post scope mismatch");
        }
        postRepository.deleteById(postId);
        logAction(actor, "DELETE", null, "faculty post#" + postId, facultyToUnivId(facultyId));
        return Map.of("success", true);
    }

    public Map<String, Object> getFacultyNotices(Long facultyId, int page) {
        return getScopedNotices("faculty", facultyId, page);
    }

    public Map<String, Object> deleteFacultyNotice(Long noticeId, Long facultyId, String actor) {
        Notice n = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found: " + noticeId));
        if (!"faculty".equals(n.getScopeType()) || !facultyId.equals(n.getScopeId())) {
            throw new RuntimeException("Notice scope mismatch");
        }
        noticeRepository.deleteById(noticeId);
        logAction(actor, "DELETE", null, "faculty notice#" + noticeId, facultyToUnivId(facultyId));
        return Map.of("success", true);
    }

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

    public Map<String, Object> updateFacultyUserStatus(Long userId, String status,
                                                         Long facultyId, String actor) {
        return updateUserStatus(userId, status, actor, facultyToUnivId(facultyId));
    }

    public List<Map<String, Object>> getFacultyMonthlyStats(Long facultyId) {
        Long univ = facultyToUnivId(facultyId);
        List<Map<String, Object>> result = new ArrayList<>();
        YearMonth now = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = now.minusMonths(i);
            LocalDateTime start = ym.atDay(1).atStartOfDay();
            LocalDateTime end   = ym.atEndOfMonth().atTime(23, 59, 59);
            long signups  = univ != null ? userRepository
                .countByUniversityIdAndCreatedDateBetween(String.valueOf(univ), start, end) : 0;
            long posts    = postRepository.countByScopeTypeAndScopeIdAndCreatedDateBetween("faculty", facultyId, start, end);
            long visitors = pageVisitRepository.countByScopeTypeAndScopeIdAndVisitedAtBetween("faculty", facultyId, start, end);
            Map<String, Object> m = new HashMap<>();
            m.put("month", ym.toString());
            m.put("signups", signups);
            m.put("posts", posts);
            m.put("visitors", visitors);
            result.add(m);
        }
        return result;
    }

    public Long facultyToUnivId(Long facultyId) {
        return facultyGroupRepository.findById(facultyId)
                .flatMap(f -> collegeSchoolRepository.findById(f.getSchoolId()))
                .map(CollegeSchool::getUniversityId)
                .orElse(null);
    }

    /** Reverse lookup: given a university and a department name, return its id. */
    public Long resolveDeptIdByName(Long universityId, String deptName) {
        return collegeSchoolRepository.findByUniversityIdOrderByIdAsc(universityId).stream()
                .flatMap(s -> facultyGroupRepository.findBySchoolIdOrderByIdAsc(s.getId()).stream())
                .flatMap(f -> departmentRepository.findByFacultyIdOrderByIdAsc(f.getId()).stream())
                .filter(d -> deptName.equals(d.getName()))
                .map(Department::getId)
                .findFirst().orElse(null);
    }

    // ── Professor / Course / Assignment ─────────────────────────────────────

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
        return professorRepository.findByDeptIdIn(deptIds).stream()
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
        return curriculumItemRepository.findByDeptIdIn(deptIds).stream()
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

    public List<Map<String, Object>> getAssignmentsByDept(Long deptId) {
        return buildAssignmentDtos(assignmentRepository.findByDeptId(deptId));
    }

    public List<Map<String, Object>> getAssignmentsByUniv(Long univId) {
        List<Long> deptIds = getDeptIdsForUniv(univId);
        return buildAssignmentDtos(assignmentRepository.findByDeptIdIn(deptIds));
    }

    public Map<String, Object> createAssignment(Long professorId, Long courseId, Long deptId) {
        if (assignmentRepository.existsByProfessorIdAndCourseId(professorId, courseId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 배정된 강의입니다");
        }
        Professor prof = professorRepository.findById(professorId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "교수 없음"));
        if (!prof.getDeptId().equals(deptId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 범위의 교수가 아닙니다");
        }
        CurriculumItem course = curriculumItemRepository.findById(courseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "강의 없음"));
        if (!course.getDeptId().equals(deptId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 범위의 강의가 아닙니다");
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
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "배정 없음"));
        if (!allowedDeptIds.contains(a.getDeptId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "삭제 권한 없음");
        }
        assignmentRepository.deleteById(assignmentId);
    }

    public List<Long> getDeptIdsForUnivPublic(Long univId) {
        return getDeptIdsForUniv(univId);
    }

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

    private List<Map<String, Object>> buildAssignmentDtos(List<ProfessorCourseAssignment> assignments) {
        if (assignments.isEmpty()) return List.of();
        List<Long> profIds   = assignments.stream().map(ProfessorCourseAssignment::getProfessorId).distinct().toList();
        List<Long> courseIds = assignments.stream().map(ProfessorCourseAssignment::getCourseId).distinct().toList();
        Map<Long, String> profNames   = professorRepository.findAllById(profIds).stream()
            .collect(Collectors.toMap(Professor::getId, Professor::getName));
        Map<Long, String> courseNames = curriculumItemRepository.findAllById(courseIds).stream()
            .collect(Collectors.toMap(CurriculumItem::getId, CurriculumItem::getName));
        return assignments.stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("professorId", a.getProfessorId());
            m.put("courseId", a.getCourseId());
            m.put("deptId", a.getDeptId());
            m.put("professorName", profNames.getOrDefault(a.getProfessorId(), ""));
            m.put("courseName", courseNames.getOrDefault(a.getCourseId(), ""));
            return m;
        }).toList();
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

    private Map<String, Object> toUserMap(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",           u.getId());
        m.put("username",     u.getUsername());
        m.put("name",         u.getName());
        m.put("memberType",   u.getMemberType());
        m.put("adminRole",    u.getAdminRole());
        m.put("status",       u.getStatus() != null ? u.getStatus() : "ACTIVE");
        m.put("approved",     "ACTIVE".equals(u.getStatus()));
        m.put("department",   u.getDepartment());
        m.put("universityId", u.getUniversityId());
        m.put("createdDate",  u.getCreatedDate() != null ? u.getCreatedDate().toString() : "");
        return m;
    }
}
