package com.example.expensetracker.controller;

import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.service.StripeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final StripeService stripeService;
    private final UserRepository userRepository;

    public BillingController(StripeService stripeService, UserRepository userRepository) {
        this.stripeService = stripeService;
        this.userRepository = userRepository;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody Map<String, String> body) {
        
        String successUrl = body.getOrDefault("successUrl", "http://localhost:4200/dashboard");
        String cancelUrl = body.getOrDefault("cancelUrl", "http://localhost:4200/dashboard");
        
        Map<String, String> sessionData = stripeService.createCheckoutSession(
                principal.getUsername(), 
                successUrl, 
                cancelUrl
        );
        return ResponseEntity.ok(sessionData);
    }

    // A simulated success endpoint to easily mock stripe payment confirmations during local sandboxed development
    @PostMapping("/simulate-success")
    public ResponseEntity<Map<String, String>> simulateSuccess(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFirstName("Akarsh");
            user.setLastName("Srivastava");
            user.setPassword("$2a$10$7zBv4t3XWv17mN2rYt4Oce1H3U1B3V7r.1lZ02z0vB478n6m.hCDe"); // default bcrypt "password"
        }
        
        user.setPremium(true);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "User upgraded to Premium successfully (Simulated)"));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getPremiumStatus(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("email", user.getEmail(), "isPremium", user.isPremium()));
    }
}
