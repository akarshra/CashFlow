package com.example.expensetracker.controller;

import com.example.expensetracker.model.dto.AnalyticsSummaryDto;
import com.example.expensetracker.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDto> summary(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(analyticsService.summary(user.getUsername()));
    }
}
