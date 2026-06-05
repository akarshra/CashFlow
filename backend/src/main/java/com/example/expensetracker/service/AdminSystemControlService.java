package com.example.expensetracker.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AdminSystemControlService {

    private final SimpMessagingTemplate messagingTemplate;
    
    private volatile boolean maintenanceMode = false;
    private volatile String rateLimitStrategy = "None"; // "None", "Standard", "Strict"
    private volatile String activeAnnouncement = "";
    private final AtomicLong requestCount = new AtomicLong(0);

    // Dynamic Feature Flags (Remote Config)
    private final Map<String, Boolean> featureFlags = new ConcurrentHashMap<>();

    // Evicted User sessions (Force logout)
    private final Set<String> evictedUsers = ConcurrentHashMap.newKeySet();

    // Sliding window request timestamps per IP address
    private final Map<String, List<Long>> ipRequestTimestamps = new ConcurrentHashMap<>();

    public AdminSystemControlService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
        // Initialize default feature flags
        featureFlags.put("aiAdvisorEnabled", true);
        featureFlags.put("ocrScannerEnabled", true);
        featureFlags.put("bankSyncEnabled", true);
    }

    public boolean isMaintenanceMode() {
        return maintenanceMode;
    }

    public void setMaintenanceMode(boolean maintenanceMode) {
        this.maintenanceMode = maintenanceMode;
    }

    public String getRateLimitStrategy() {
        return rateLimitStrategy;
    }

    public void setRateLimitStrategy(String rateLimitStrategy) {
        this.rateLimitStrategy = rateLimitStrategy;
    }

    public String getActiveAnnouncement() {
        return activeAnnouncement;
    }

    public void setActiveAnnouncement(String activeAnnouncement) {
        this.activeAnnouncement = activeAnnouncement;
    }

    public long getRequestCount() {
        return requestCount.get();
    }

    public void incrementRequestCount() {
        requestCount.incrementAndGet();
    }

    public Map<String, Boolean> getFeatureFlags() {
        return featureFlags;
    }

    public void updateFeatureFlag(String feature, boolean enabled) {
        featureFlags.put(feature, enabled);
        
        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("type", "feature_flags_update");
        wsPayload.put("feature", feature);
        wsPayload.put("enabled", enabled);
        wsPayload.put("isSystemNotification", true);

        try {
            messagingTemplate.convertAndSend("/topic/notifications", wsPayload);
        } catch (Exception e) {
            // ignore
        }
    }

    public void evictUser(String username) {
        evictedUsers.add(username);
    }

    public void reinstateUser(String username) {
        evictedUsers.remove(username);
    }

    public boolean isUserEvicted(String username) {
        return username != null && evictedUsers.contains(username);
    }

    public void broadcastAnnouncement(String message) {
        this.activeAnnouncement = message;
        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("type", "global_announcement");
        wsPayload.put("message", message);
        wsPayload.put("timestamp", Instant.now().toString());
        wsPayload.put("isSystemNotification", true);

        try {
            messagingTemplate.convertAndSend("/topic/notifications", wsPayload);
        } catch (Exception e) {
            // ignore
        }
    }

    public void streamRequestLog(String method, String uri, String ip, int status, long duration) {
        Map<String, Object> logPayload = new HashMap<>();
        logPayload.put("method", method);
        logPayload.put("uri", uri);
        logPayload.put("ip", ip);
        logPayload.put("status", status);
        logPayload.put("duration", duration);
        logPayload.put("timestamp", Instant.now().toString());

        try {
            messagingTemplate.convertAndSend("/topic/live-traffic", logPayload);
        } catch (Exception e) {
            // ignore
        }
    }

    public boolean isRateLimited(String clientIp) {
        if ("None".equalsIgnoreCase(rateLimitStrategy)) {
            return false;
        }

        int limit = "Strict".equalsIgnoreCase(rateLimitStrategy) ? 10 : 60; // Strict: 10/min, Standard: 60/min
        long now = System.currentTimeMillis();
        long windowStart = now - 60000; // 1 minute window

        List<Long> timestamps = ipRequestTimestamps.computeIfAbsent(clientIp, k -> Collections.synchronizedList(new ArrayList<>()));
        
        synchronized (timestamps) {
            // Remove timestamps older than 1 minute
            timestamps.removeIf(t -> t < windowStart);
            if (timestamps.size() >= limit) {
                return true;
            }
            timestamps.add(now);
        }
        return false;
    }
}
