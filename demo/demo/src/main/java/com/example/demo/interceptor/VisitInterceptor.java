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
