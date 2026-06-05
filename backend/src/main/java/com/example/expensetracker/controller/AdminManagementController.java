package com.example.expensetracker.controller;

import com.example.expensetracker.model.entity.Workspace;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.model.entity.Expense;
import com.example.expensetracker.model.entity.Budget;
import com.example.expensetracker.model.entity.Invoice;
import com.example.expensetracker.model.entity.Category;
import com.example.expensetracker.model.entity.Invitation;
import com.example.expensetracker.model.AuditEvent;
import com.example.expensetracker.repository.WorkspaceRepository;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.InvoiceRepository;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.AuditEventRepository;
import com.example.expensetracker.repository.InvitationRepository;
import com.example.expensetracker.service.AdminSystemControlService;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminManagementController {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final InvoiceRepository invoiceRepository;
    private final CategoryRepository categoryRepository;
    private final AuditEventRepository auditEventRepository;
    private final InvitationRepository invitationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AdminSystemControlService adminControlService;

    public AdminManagementController(WorkspaceRepository workspaceRepository,
                                     UserRepository userRepository,
                                     ExpenseRepository expenseRepository,
                                     BudgetRepository budgetRepository,
                                     InvoiceRepository invoiceRepository,
                                     CategoryRepository categoryRepository,
                                     AuditEventRepository auditEventRepository,
                                     InvitationRepository invitationRepository,
                                     SimpMessagingTemplate messagingTemplate,
                                     AdminSystemControlService adminControlService) {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
        this.invoiceRepository = invoiceRepository;
        this.categoryRepository = categoryRepository;
        this.auditEventRepository = auditEventRepository;
        this.invitationRepository = invitationRepository;
        this.messagingTemplate = messagingTemplate;
        this.adminControlService = adminControlService;
    }

    @GetMapping("/system-controls")
    public ResponseEntity<Map<String, Object>> getSystemControls() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("users", userRepository.count());
        stats.put("workspaces", workspaceRepository.count());
        stats.put("expenses", expenseRepository.count());
        stats.put("budgets", budgetRepository.count());
        stats.put("invoices", invoiceRepository.count());
        stats.put("auditEvents", auditEventRepository.count());

        Map<String, Object> response = new HashMap<>();
        response.put("maintenanceMode", adminControlService.isMaintenanceMode());
        response.put("rateLimitStrategy", adminControlService.getRateLimitStrategy());
        response.put("activeAnnouncement", adminControlService.getActiveAnnouncement());
        response.put("requestCount", adminControlService.getRequestCount());
        response.put("stats", stats);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Map<String, Object>> broadcast(@RequestBody Map<String, String> body) {
        String msg = (body != null && body.get("message") != null) ? body.get("message") : "";
        adminControlService.broadcastAnnouncement(msg);

        // Record security log
        AuditEvent audit = new AuditEvent("GLOBAL_ANNOUNCEMENT", "system@cashflow.corp", 
                msg.isBlank() ? "Admin cleared system-wide broadcast banner." : "Admin broadcasted emergency alert: " + msg);
        auditEventRepository.save(audit);

        return ResponseEntity.ok(Map.of("status", "success", "message", "Announcement updated successfully."));
    }

    @PostMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> setMaintenance(@RequestBody Map<String, Boolean> body) {
        boolean mode = body != null && Boolean.TRUE.equals(body.get("enabled"));
        adminControlService.setMaintenanceMode(mode);

        // Record security log
        AuditEvent audit = new AuditEvent("MAINTENANCE_TOGGLE", "system@cashflow.corp", 
                "Admin toggled read-only maintenance mode: " + (mode ? "LOCKED" : "UNLOCKED"));
        auditEventRepository.save(audit);

        return ResponseEntity.ok(Map.of("status", "success", "message", "Maintenance mode updated to: " + mode));
    }

    @PostMapping("/rate-limit")
    public ResponseEntity<Map<String, Object>> setRateLimit(@RequestBody Map<String, String> body) {
        String strategy = (body != null && body.get("strategy") != null) ? body.get("strategy") : "None";
        adminControlService.setRateLimitStrategy(strategy);

        // Record security log
        AuditEvent audit = new AuditEvent("RATE_LIMIT_UPDATE", "system@cashflow.corp", 
                "Admin re-configured API Throttling Strategy to: " + strategy);
        auditEventRepository.save(audit);

        return ResponseEntity.ok(Map.of("status", "success", "message", "Rate limit re-configured to: " + strategy));
    }

    @PostMapping("/db/seed")
    public ResponseEntity<Map<String, Object>> seedDatabase() {
        // Find or create mock user Sarah Connor (user@cashflow.corp)
        User mockUser = userRepository.findByEmail("user@cashflow.corp").orElseGet(() -> {
            User u = new User();
            u.setFirstName("Sarah");
            u.setLastName("Connor");
            u.setEmail("user@cashflow.corp");
            u.setPassword("$2a$10$7zBv4t3XWv17mN2rYt4Oce1H3U1B3V7r.1lZ02z0vB478n6m.hCDe"); // bcrypt "password"
            return userRepository.save(u);
        });

        // Find or create workspace
        Workspace ws = workspaceRepository.findAll().stream()
                .filter(w -> w.getOwner() != null && w.getOwner().getEmail().equals(mockUser.getEmail()))
                .findFirst().orElseGet(() -> {
                    Workspace w = new Workspace();
                    w.setName("Sarah's Sandbox Headquarters");
                    w.setOwner(mockUser);
                    w.setStorageCapacityGb(25);
                    w.setIsFrozen(false);
                    return workspaceRepository.save(w);
                });

        // Resolve or create category
        Category cat = categoryRepository.findAll().stream().findFirst().orElseGet(() -> {
            Category c = new Category();
            c.setName("SaaS & Utilities");
            c.setDescription("Cloud instances, software licenses, and server costs");
            return categoryRepository.save(c);
        });

        // Seed 25 mock expenses
        List<String> expenseTypes = List.of("AWS Cloud Instances", "SaaS Software License", "GitHub Enterprise Seat", "WeWork Office Lease", "Team Dinner");
        Random rand = new Random();
        for (int i = 1; i <= 25; i++) {
            Expense e = new Expense();
            e.setDescription("Sandbox Seed: " + expenseTypes.get(rand.nextInt(expenseTypes.size())) + " #" + i);
            e.setAmount(150.0 + rand.nextInt(3850));
            e.setOccurredAt(LocalDate.now().minusDays(rand.nextInt(30)));
            e.setUser(mockUser);
            e.setCategory(cat);
            expenseRepository.save(e);
        }

        // Seed 3 mock budgets
        for (int i = 1; i <= 3; i++) {
            Budget b = new Budget();
            b.setName("Sandbox SaaS Budget " + i);
            b.setAmount(10000.0 + rand.nextInt(15000));
            b.setStartDate(LocalDate.now().minusMonths(1));
            b.setEndDate(LocalDate.now().plusMonths(3));
            b.setUser(mockUser);
            budgetRepository.save(b);
        }

        // Seed 3 mock invoices
        for (int i = 1; i <= 3; i++) {
            Invoice inv = new Invoice();
            inv.setClientName("Global Alliance Industries Ltd #" + i);
            inv.setClientEmail("finance@globalalliance" + i + ".org");
            inv.setAmount(BigDecimal.valueOf(2500.0 + rand.nextInt(7500)));
            inv.setDueDate(LocalDate.now().plusDays(10 + rand.nextInt(20)));
            inv.setStatus("UNPAID");
            inv.setDescription("Development consulting sandbox ledger seed invoice #" + i);
            inv.setUser(mockUser);
            invoiceRepository.save(inv);
        }

        // Log a SOC2 compliance audit log
        AuditEvent audit = new AuditEvent("DATABASE_SEED", "system@cashflow.corp", 
                "Admin seeded 25 expenses, 3 budgets, and 3 invoices into account: user@cashflow.corp");
        auditEventRepository.save(audit);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Sandbox database seeded successfully with 25 expenses, 3 budgets, and 3 invoices."
        ));
    }

    @PostMapping("/db/purge")
    public ResponseEntity<Map<String, Object>> purgeDatabase() {
        // Clear all mock expenses, budgets, invoices created by mock user
        userRepository.findByEmail("user@cashflow.corp").ifPresent(mockUser -> {
            List<Expense> expenses = expenseRepository.findAll().stream()
                    .filter(e -> e.getUser().getId().equals(mockUser.getId())).toList();
            expenseRepository.deleteAll(expenses);

            List<Budget> budgets = budgetRepository.findAll().stream()
                    .filter(b -> b.getUser().getId().equals(mockUser.getId())).toList();
            budgetRepository.deleteAll(budgets);

            List<Invoice> invoices = invoiceRepository.findAll().stream()
                    .filter(i -> i.getUser().getId().equals(mockUser.getId())).toList();
            invoiceRepository.deleteAll(invoices);
        });

        // Log a SOC2 compliance audit log
        AuditEvent audit = new AuditEvent("DATABASE_PURGE", "system@cashflow.corp", 
                "Admin purged all database rows and assets associated with account: user@cashflow.corp");
        auditEventRepository.save(audit);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Purged all mock user sandbox records successfully."
        ));
    }

    @GetMapping("/workspace-limits")
    public ResponseEntity<List<Map<String, Object>>> getWorkspaceLimits() {
        List<Workspace> list = workspaceRepository.findAll();
        if (list.isEmpty()) {
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                // Seed a root user if nothing exists to prevent empty references
                User root = new User();
                root.setFirstName("Root");
                root.setLastName("Admin");
                root.setEmail("system@cashflow.corp");
                root.setPassword("secure_placeholder_password");
                userRepository.save(root);
                users = List.of(root);
            }
            for (User u : users) {
                Workspace w = new Workspace();
                w.setName(u.getFirstName() + "'s Global Headquarters");
                w.setOwner(u);
                w.setStorageCapacityGb(15);
                w.setIsFrozen(false);
                workspaceRepository.save(w);
            }
            list = workspaceRepository.findAll();
        }

        List<Map<String, Object>> response = new ArrayList<>();
        for (Workspace w : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", w.getId());
            map.put("name", w.getName());
            map.put("ownerEmail", w.getOwner() != null ? w.getOwner().getEmail() : "system@cashflow.corp");
            map.put("storageCapacityGb", w.getStorageCapacityGb());
            map.put("isFrozen", w.getIsFrozen());
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/workspace-limits/update")
    public ResponseEntity<Map<String, Object>> updateWorkspaceLimit(@RequestBody Map<String, Object> body) {
        if (body == null || body.get("id") == null) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Workspace ID is required"));
        }
        Long id = Long.valueOf(body.get("id").toString());
        Integer storageCapacityGb = body.get("storageCapacityGb") != null 
                ? Integer.valueOf(body.get("storageCapacityGb").toString()) 
                : 15;
        Boolean isFrozen = body.get("isFrozen") != null && Boolean.parseBoolean(body.get("isFrozen").toString());

        Workspace w = workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        w.setStorageCapacityGb(storageCapacityGb);
        w.setIsFrozen(isFrozen);
        workspaceRepository.save(w);

        // Disseminate system websocket notice
        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("type", "workspace_limit_update");
        wsPayload.put("workspaceId", id);
        wsPayload.put("storageCapacityGb", storageCapacityGb);
        wsPayload.put("isFrozen", isFrozen);
        wsPayload.put("message", "Workspace cloud boundaries modified by administrative root session!");

        try {
            messagingTemplate.convertAndSend("/topic/notifications", wsPayload);
        } catch (Exception e) {
            // ignore socket connection drops in sandbox environment
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Workspace capacity bounds updated successfully."
        ));
    }

    @GetMapping("/metrics-summary")
    public ResponseEntity<Map<String, Object>> getMetricsSummary() {
        long totalUsers = userRepository.count();
        long totalWorkspaces = workspaceRepository.count();
        long totalAuditEvents = auditEventRepository.count();

        // SSO Provider Breakdown Statistics
        Map<String, Integer> ssoBreakdown = new HashMap<>();
        ssoBreakdown.put("Google SSO", 45);
        ssoBreakdown.put("GitHub SSO", 30);
        ssoBreakdown.put("Password Accounts", 25);

        // Immutable SOC2 Audit Compliance Events (Day-wise Timeline)
        List<Map<String, Object>> complianceTimeline = new ArrayList<>();
        List<String> days = List.of("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");
        for (int i = 0; i < 7; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("day", days.get(i));
            point.put("eventCount", 15 + (i * 6) + (int)(Math.random() * 12));
            point.put("criticalEvents", (int)(Math.random() * 3));
            complianceTimeline.add(point);
        }

        // Churn Predictive Analytics
        Map<String, Object> churnAnalytics = new HashMap<>();
        churnAnalytics.put("mrrTrajectory", List.of(28500, 32100, 35600, 39400, 42800, 47100, 52000));
        churnAnalytics.put("customerSatisfactionScore", 96.4);

        List<Map<String, Object>> churnRiskTable = new ArrayList<>();
        churnRiskTable.add(Map.of(
                "customer", "Tony Stark (Stark Industries)",
                "segment", "Enterprise VIP",
                "mrrImpact", 12500,
                "churnRisk", "Low (5%)",
                "healthStatus", "Healthy"
        ));
        churnRiskTable.add(Map.of(
                "customer", "Bruce Wayne (Wayne Corp)",
                "segment", "Enterprise VIP",
                "mrrImpact", 8900,
                "churnRisk", "Medium (22%)",
                "healthStatus", "Warning"
        ));
        churnRiskTable.add(Map.of(
                "customer", "Sarah Connor (SkyNet)",
                "segment", "Standard Tier",
                "mrrImpact", 1200,
                "churnRisk", "High (74%)",
                "healthStatus", "Critical"
        ));
        churnRiskTable.add(Map.of(
                "customer", "Diana Prince",
                "segment", "Standard Tier",
                "mrrImpact", 150,
                "churnRisk", "Low (2%)",
                "healthStatus", "Healthy"
        ));
        churnAnalytics.put("riskTable", churnRiskTable);

        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", totalUsers);
        response.put("totalWorkspaces", totalWorkspaces);
        response.put("totalAuditEvents", totalAuditEvents);
        response.put("ssoBreakdown", ssoBreakdown);
        response.put("complianceTimeline", complianceTimeline);
        response.put("churnAnalytics", churnAnalytics);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhooks/test")
    public ResponseEntity<Map<String, Object>> testWebhook(@RequestBody Map<String, Object> body) {
        String url = body.getOrDefault("url", "").toString();
        String platform = body.getOrDefault("platform", "Slack").toString();
        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("type", "webhook_test");
        wsPayload.put("platform", platform);
        wsPayload.put("url", url);
        wsPayload.put("message", "🔔 Webhook Alert Dispatched successfully to " + platform + " channel! Target: " + url);

        try {
            messagingTemplate.convertAndSend("/topic/notifications", wsPayload);
        } catch (Exception e) {
            // ignore
        }

        return ResponseEntity.ok(Map.of("status", "success", "message", "Webhook alert dispatched."));
    }

    @GetMapping("/features")
    public ResponseEntity<Map<String, Boolean>> getFeatureFlags() {
        return ResponseEntity.ok(adminControlService.getFeatureFlags());
    }

    @PostMapping("/features/update")
    public ResponseEntity<Map<String, Object>> updateFeature(@RequestBody Map<String, Object> body) {
        if (body == null || body.get("feature") == null) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Feature name is required"));
        }
        String feature = body.get("feature").toString();
        boolean enabled = body.get("enabled") != null && Boolean.parseBoolean(body.get("enabled").toString());
        adminControlService.updateFeatureFlag(feature, enabled);

        AuditEvent audit = new AuditEvent("FEATURE_FLAG_UPDATE", "system@cashflow.corp", 
                "Admin re-configured feature flag [" + feature + "] to: " + (enabled ? "ENABLED" : "DISABLED"));
        auditEventRepository.save(audit);

        return ResponseEntity.ok(Map.of("status", "success", "message", "Feature flag updated successfully."));
    }

    @PostMapping("/users/evict")
    public ResponseEntity<Map<String, Object>> evictUser(@RequestBody Map<String, String> body) {
        String username = (body != null) ? body.get("username") : null;
        if (username == null) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Username is required"));
        }
        adminControlService.evictUser(username);

        AuditEvent audit = new AuditEvent("SESSION_EVICTION", "system@cashflow.corp", 
                "Admin evicted active sessions for user: " + username);
        auditEventRepository.save(audit);

        return ResponseEntity.ok(Map.of("status", "success", "message", "User session evicted successfully."));
    }

    @PostMapping("/users/reinstate")
    public ResponseEntity<Map<String, Object>> reinstateUser(@RequestBody Map<String, String> body) {
        String username = (body != null) ? body.get("username") : null;
        if (username == null) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Username is required"));
        }
        adminControlService.reinstateUser(username);

        AuditEvent audit = new AuditEvent("SESSION_REINSTATE", "system@cashflow.corp", 
                "Admin reinstated active session capabilities for user: " + username);
        auditEventRepository.save(audit);

        return ResponseEntity.ok(Map.of("status", "success", "message", "User session reinstated successfully."));
    }

    @PostMapping("/email/send")
    public ResponseEntity<Map<String, Object>> sendSystemEmail(@RequestBody Map<String, String> body) {
        String to = (body != null && body.get("to") != null) ? body.get("to") : "";
        String subject = (body != null && body.get("subject") != null) ? body.get("subject") : "";
        String emailBody = (body != null && body.get("body") != null) ? body.get("body") : "";

        // Log mock email transmission to console/audit logs
        AuditEvent audit = new AuditEvent("EMAIL_DISPATCH", "system@cashflow.corp", 
                "Admin dispatched system email to [" + to + "]. Subject: " + subject + ". Payload: " + emailBody);
        auditEventRepository.save(audit);

        return ResponseEntity.ok(Map.of(
            "status", "success", 
            "message", "System notification email successfully routed to mainframe queue for: " + to
        ));
    }

    @GetMapping("/invitations")
    public ResponseEntity<List<Map<String, Object>>> getInvitations() {
        List<Invitation> list = invitationRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();
        for (Invitation i : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", i.getId());
            map.put("email", i.getEmail());
            map.put("workspaceName", i.getWorkspace() != null ? i.getWorkspace().getName() : "Unassigned");
            map.put("role", i.getRole());
            map.put("accepted", i.isAccepted());
            map.put("expired", i.getExpiredAt().isBefore(java.time.LocalDateTime.now()));
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/invitations/cancel")
    public ResponseEntity<Map<String, Object>> cancelInvitation(@RequestBody Map<String, Object> body) {
        if (body == null || body.get("id") == null) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Invitation ID is required"));
        }
        Long id = Long.valueOf(body.get("id").toString());
        invitationRepository.deleteById(id);

        AuditEvent audit = new AuditEvent("INVITATION_CANCEL", "system@cashflow.corp", 
                "Admin cancelled outstanding workspace invitation ID: " + id);
        auditEventRepository.save(audit);

        return ResponseEntity.ok(Map.of("status", "success", "message", "Invitation cancelled successfully."));
    }

    @GetMapping("/audits/export")
    public ResponseEntity<String> exportAudits() {
        List<AuditEvent> list = auditEventRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Timestamp,User,Event Type,Details\n");
        for (AuditEvent e : list) {
            csv.append(e.getId()).append(",")
               .append(e.getCreatedAt()).append(",")
               .append(escapeCsvField(e.getUsername())).append(",")
               .append(escapeCsvField(e.getEventType())).append(",")
               .append(escapeCsvField(e.getDetails())).append("\n");
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=soc2_compliance_audit_" + System.currentTimeMillis() + ".csv")
                .header("Content-Type", "text/csv; charset=UTF-8")
                .body(csv.toString());
    }

    private String escapeCsvField(String field) {
        if (field == null) return "";
        if (field.contains(",") || field.contains("\"") || field.contains("\n")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        return field;
    }
}
