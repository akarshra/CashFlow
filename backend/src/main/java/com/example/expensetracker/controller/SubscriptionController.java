package com.example.expensetracker.controller;

import com.example.expensetracker.model.dto.SubscriptionDto;
import com.example.expensetracker.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionDto>> getSubscriptions(Authentication auth) {
        return ResponseEntity.ok(subscriptionService.getSubscriptions(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<SubscriptionDto> addSubscription(@RequestBody SubscriptionDto dto, Authentication auth) {
        return ResponseEntity.ok(subscriptionService.addSubscription(auth.getName(), dto));
    }
}
