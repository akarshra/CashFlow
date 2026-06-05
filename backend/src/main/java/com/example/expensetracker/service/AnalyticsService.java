package com.example.expensetracker.service;

import com.example.expensetracker.model.dto.AnalyticsSummaryDto;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public AnalyticsService(ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    @Cacheable(value = "dashboardSummary", key = "#userEmail")
    public AnalyticsSummaryDto summary(String userEmail) {
        var user = userRepository.findByEmail(userEmail).orElseThrow();
        var expenses = expenseRepository.findByUser(user);

        double totalExpenses = expenses.stream().mapToDouble(e -> e.getAmount()).sum();
        double totalIncome = totalExpenses * 1.42; // sample projection
        double monthlySavings = totalIncome - totalExpenses;

        Map<String, Double> categoryBreakdown = expenses.stream()
            .collect(Collectors.groupingBy(e -> e.getCategory().getName(), Collectors.summingDouble(e -> e.getAmount())));

        AnalyticsSummaryDto dto = new AnalyticsSummaryDto();
        dto.setTotalIncome(totalIncome);
        dto.setTotalExpenses(totalExpenses);
        dto.setMonthlySavings(monthlySavings);
        dto.setCategoryBreakdown(categoryBreakdown.entrySet().stream().map(entry -> {
            AnalyticsSummaryDto.CategoryBreakdown breakdown = new AnalyticsSummaryDto.CategoryBreakdown();
            breakdown.setCategory(entry.getKey());
            breakdown.setAmount(entry.getValue());
            return breakdown;
        }).collect(Collectors.toList()));
        return dto;
    }
}
