package com.example.expensetracker.controller;

import com.example.expensetracker.model.dto.ExpenseDto;
import com.example.expensetracker.model.entity.Category;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks/simulator")
public class WebhookSimulatorController {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseService expenseService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebhookSimulatorController(UserRepository userRepository,
                                      CategoryRepository categoryRepository,
                                      ExpenseService expenseService,
                                      SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.expenseService = expenseService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/stripe")
    public ResponseEntity<Map<String, Object>> simulateStripeWebhook(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String, String> body) {
        
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            if (principal != null) {
                email = principal.getUsername();
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        user.setPremium(true);
        userRepository.save(user);

        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("type", "stripe_webhook");
        wsPayload.put("email", email);
        wsPayload.put("message", "Stripe payment successful! Enterprise Premium unlocked.");
        wsPayload.put("isPremium", true);

        try {
            messagingTemplate.convertAndSend("/topic/notifications", wsPayload);
        } catch (Exception e) {
            // Ignore socket failure
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Simulated Stripe webhook handled successfully",
                "user", email,
                "isPremium", true
        ));
    }

    @PostMapping("/plaid")
    public ResponseEntity<Map<String, Object>> simulatePlaidWebhook(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String, Object> body) {

        String email = (String) body.get("email");
        if (email == null || email.isBlank()) {
            if (principal != null) {
                email = principal.getUsername();
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }

        double amount = 0.0;
        if (body.get("amount") != null) {
            amount = Double.parseDouble(body.get("amount").toString());
        } else {
            amount = 15.00 + (Math.random() * 85.00); // random amount between 15 and 100
        }

        String description = (String) body.getOrDefault("description", "Plaid Instant Transaction Swipe");

        // Determine category
        Long categoryId = null;
        if (body.get("categoryId") != null) {
            categoryId = Long.parseLong(body.get("categoryId").toString());
        } else {
            List<Category> categories = categoryRepository.findAll();
            if (!categories.isEmpty()) {
                categoryId = categories.get(0).getId();
            } else {
                // Let's create a default category if none exists
                Category cat = new Category();
                cat.setName("Uncategorized");
                categoryRepository.save(cat);
                categoryId = cat.getId();
            }
        }

        ExpenseDto dto = new ExpenseDto();
        dto.setCategoryId(categoryId);
        dto.setDescription(description);
        dto.setAmount(amount);
        dto.setOccurredAt(LocalDate.now().toString());

        ExpenseDto created = expenseService.create(email, dto);

        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("type", "plaid_webhook");
        wsPayload.put("email", email);
        wsPayload.put("message", "Simulated Plaid Transaction Alert: " + description + " of " + amount + " INR");
        wsPayload.put("expense", created);

        try {
            messagingTemplate.convertAndSend("/topic/notifications", wsPayload);
        } catch (Exception e) {
            // Ignore socket failure
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Simulated Plaid transaction swipe registered",
                "expense", created
        ));
    }
}
