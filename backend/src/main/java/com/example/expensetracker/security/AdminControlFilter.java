package com.example.expensetracker.security;

import com.example.expensetracker.service.AdminSystemControlService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@Component
public class AdminControlFilter extends OncePerRequestFilter {

    private final AdminSystemControlService adminControlService;

    public AdminControlFilter(AdminSystemControlService adminControlService) {
        this.adminControlService = adminControlService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Increment request count for analytics
        adminControlService.incrementRequestCount();

        // Exclude WebSocket handshake, static resources, authentication and admin management paths from locks/limits
        boolean isExcludedPath = path.startsWith("/api/auth/") 
                || path.startsWith("/api/admin/") 
                || path.startsWith("/api/webhooks/") 
                || path.startsWith("/ws")
                || path.equals("/api/system/announcement")
                || path.equals("/api/system/features");

        String clientIp = getClientIp(request);

        if (!isExcludedPath) {
            // 1. Check Rate Limiter
            if (adminControlService.isRateLimited(clientIp)) {
                sendErrorResponse(response, HttpStatus.TOO_MANY_REQUESTS, 
                        "{\"error\": \"Too many requests. Administrative policy: [" 
                        + adminControlService.getRateLimitStrategy() + "] rate limit exceeded.\"}");
                adminControlService.streamRequestLog(method, path, clientIp, 429, 0);
                return;
            }

            // 2. Check Maintenance Lock
            if (adminControlService.isMaintenanceMode() && isModifyingMethod(method)) {
                sendErrorResponse(response, HttpStatus.SERVICE_UNAVAILABLE, 
                        "{\"error\": \"System is in read-only maintenance mode. Database modifications are temporarily locked by the administrator.\"}");
                adminControlService.streamRequestLog(method, path, clientIp, 503, 0);
                return;
            }
        }

        long startTime = System.currentTimeMillis();
        int status = 200;
        try {
            filterChain.doFilter(request, response);
            status = response.getStatus();
        } catch (ServletException | IOException | RuntimeException e) {
            status = 500;
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            if (!path.startsWith("/ws")) { // Skip WebSocket poll handshake spam
                adminControlService.streamRequestLog(method, path, clientIp, status, duration);
            }
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private boolean isModifyingMethod(String method) {
        return List.of("POST", "PUT", "DELETE", "PATCH").contains(method.toUpperCase());
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String jsonBody) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(jsonBody);
    }
}
