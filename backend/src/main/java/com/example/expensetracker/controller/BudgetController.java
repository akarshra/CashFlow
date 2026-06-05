package com.example.expensetracker.controller;

import com.example.expensetracker.model.dto.BudgetDto;
import com.example.expensetracker.service.BudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<List<BudgetDto>> list(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(budgetService.list(user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<BudgetDto> create(@AuthenticationPrincipal UserDetails user,
                                            @RequestBody BudgetDto dto) {
        return ResponseEntity.ok(budgetService.create(user.getUsername(), dto));
    }

    @PutMapping("/{id}/share")
    public ResponseEntity<BudgetDto> share(@AuthenticationPrincipal UserDetails user,
                                           @PathVariable Long id,
                                           @RequestBody Map<String, String> request) {
        String collaboratorEmail = request.get("collaboratorEmail");
        return ResponseEntity.ok(budgetService.shareBudget(user.getUsername(), id, collaboratorEmail));
    }
}
