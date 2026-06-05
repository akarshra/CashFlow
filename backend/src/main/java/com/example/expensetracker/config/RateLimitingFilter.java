package com.example.expensetracker.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createBucket(boolean authPath) {
        if (authPath) {
            // stricter for auth endpoints: 10 reqs per minute
            Bandwidth limit = Bandwidth.classic(10, Refill.greedy(10, Duration.ofMinutes(1)));
            @SuppressWarnings("deprecation")
            final Bucket b = Bucket4j.builder().addLimit(limit).build();
            return b;
        }
        // general API: 200 reqs per minute
        Bandwidth limit = Bandwidth.classic(200, Refill.greedy(200, Duration.ofMinutes(1)));
        @SuppressWarnings("deprecation")
        final Bucket b = Bucket4j.builder().addLimit(limit).build();
        return b;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String ip = extractClientIp(request);
        boolean authPath = request.getRequestURI().startsWith("/api/auth");
        Bucket bucket = buckets.computeIfAbsent(ip + (authPath ? ":auth" : ":api"), k -> createBucket(authPath));

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/json;charset=UTF-8");
            String body = "{\"message\":\"Too many requests - try again later\"}";
            response.getWriter().write(body);
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        String remote = request.getRemoteAddr();
        return remote == null ? "unknown" : remote;
    }
}
