package com.example.expensetracker.controller;

import com.example.expensetracker.model.dto.ExpenseDto;
import com.example.expensetracker.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> list(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(expenseService.list(user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<ExpenseDto> create(@AuthenticationPrincipal UserDetails user,
                                             @RequestBody ExpenseDto dto) {
        return ResponseEntity.ok(expenseService.create(user.getUsername(), dto));
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseDto> update(@AuthenticationPrincipal UserDetails user,
                                             @PathVariable Long expenseId,
                                             @RequestBody ExpenseDto dto) {
        return ResponseEntity.ok(expenseService.update(user.getUsername(), expenseId, dto));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails user,
                                       @PathVariable Long expenseId) {
        expenseService.delete(user.getUsername(), expenseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/export/csv", produces = "text/csv")
    public ResponseEntity<String> exportCsv(@AuthenticationPrincipal UserDetails user) {
        List<ExpenseDto> expenses = expenseService.list(user.getUsername());
        StringBuilder csv = new StringBuilder("ID,Description,Amount,Category,Date\n");
        for (ExpenseDto exp : expenses) {
            csv.append(exp.getId()).append(",")
               .append(exp.getDescription()).append(",")
               .append(exp.getAmount()).append(",")
               .append(exp.getCategoryId()).append(",")
               .append(exp.getOccurredAt()).append("\n");
        }
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=\"expenses.csv\"");
        return new ResponseEntity<>(csv.toString(), headers, org.springframework.http.HttpStatus.OK);
    }
}
