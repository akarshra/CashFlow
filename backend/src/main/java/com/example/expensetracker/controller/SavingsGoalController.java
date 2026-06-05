package com.example.expensetracker.controller;

import com.example.expensetracker.model.dto.SavingsGoalDto;
import com.example.expensetracker.service.SavingsGoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    public SavingsGoalController(SavingsGoalService savingsGoalService) {
        this.savingsGoalService = savingsGoalService;
    }

    @GetMapping
    public ResponseEntity<List<SavingsGoalDto>> list(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(savingsGoalService.list(user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<SavingsGoalDto> create(@AuthenticationPrincipal UserDetails user,
                                                 @RequestBody SavingsGoalDto dto) {
        return ResponseEntity.ok(savingsGoalService.create(user.getUsername(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalDto> update(@AuthenticationPrincipal UserDetails user,
                                                 @PathVariable Long id,
                                                 @RequestBody SavingsGoalDto dto) {
        return ResponseEntity.ok(savingsGoalService.update(user.getUsername(), id, dto));
    }
}
