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

    // Backward compat: SuperAdminController still calls approveUser(id, boolean)
    public Map<String, Object> approveUser(Long userId, boolean approved) {
        return updateUserStatus(userId, approved ? "ACTIVE" : "PENDING_APPROVAL",
                                "system", null);
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
