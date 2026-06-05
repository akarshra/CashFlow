package com.example.expensetracker.controller;

import com.example.expensetracker.model.dto.AiInsightDto;
import com.example.expensetracker.model.dto.ExpenseDto;
import com.example.expensetracker.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/categorize")
    public ResponseEntity<AiInsightDto> categorize(@RequestBody ExpenseDto expenseDto) {
        return ResponseEntity.ok(aiService.categorizeExpense(expenseDto));
    }

    @GetMapping("/insights")
    public ResponseEntity<AiInsightDto> insights(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(aiService.generateMonthlyInsight(user.getUsername()));
    }

    @PostMapping("/parse-receipt")
    public ResponseEntity<Map<String, String>> parseReceipt(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(aiService.parseReceipt(file));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chatWithData(@AuthenticationPrincipal UserDetails user,
                                                            @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(aiService.chatWithData(user.getUsername(), payload.get("prompt")));
    }

    @GetMapping("/forecast")
    public ResponseEntity<AiInsightDto> forecast(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(aiService.predictiveForecast(user.getUsername()));
    }

    @GetMapping("/runway-projection")
    public ResponseEntity<Map<String, Object>> runwayProjection(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(aiService.predictiveRunway(user.getUsername()));
    }

    @GetMapping("/audit-alerts")
    public ResponseEntity<java.util.List<Map<String, String>>> auditAlerts(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(aiService.auditAlerts(user.getUsername()));
    }
}
