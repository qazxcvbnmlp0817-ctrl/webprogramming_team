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
                        LocalDate.now().minusDays(29).atStartOfDay());
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
