package com.example.expensetracker.controller;

import com.example.expensetracker.model.dto.IncomeDto;
import com.example.expensetracker.service.IncomeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
public class IncomeController {
    private final IncomeService incomeService;

    public IncomeController(IncomeService incomeService) {
        this.incomeService = incomeService;
    }

    @GetMapping
    public ResponseEntity<List<IncomeDto>> getIncomes(Authentication auth) {
        return ResponseEntity.ok(incomeService.getIncomes(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<IncomeDto> addIncome(@RequestBody IncomeDto dto, Authentication auth) {
        return ResponseEntity.ok(incomeService.addIncome(auth.getName(), dto));
    }
}
