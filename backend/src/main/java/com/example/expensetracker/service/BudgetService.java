package com.example.expensetracker.service;

import com.example.expensetracker.model.dto.BudgetDto;
import com.example.expensetracker.model.entity.Budget;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    public List<BudgetDto> list(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        String collaboratorPattern = "," + userEmail + ",";
        return budgetRepository.findByUserOrCollaboratorsContaining(user, collaboratorPattern)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public BudgetDto create(String userEmail, BudgetDto dto) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Budget budget = new Budget();
        budget.setUser(user);
        budget.setName(dto.getName());
        budget.setAmount(dto.getAmount());
        budget.setStartDate(LocalDate.parse(dto.getStartDate()));
        budget.setEndDate(LocalDate.parse(dto.getEndDate()));
        budget.setCollaborators(normalizeCollaborators(dto.getCollaborators()));
        return toDto(budgetRepository.save(budget));
    }

    public BudgetDto shareBudget(String userEmail, Long budgetId, String collaboratorEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found."));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Only the owner can share this budget.");
        }

        List<String> collaborators = deserializeCollaborators(budget.getCollaborators());
        if (!collaborators.contains(collaboratorEmail)) {
            collaborators.add(collaboratorEmail);
            budget.setCollaborators(normalizeCollaborators(collaborators));
            budget = budgetRepository.save(budget);
        }

        return toDto(budget);
    }

    private BudgetDto toDto(Budget budget) {
        BudgetDto dto = new BudgetDto();
        dto.setId(budget.getId());
        dto.setName(budget.getName());
        dto.setAmount(budget.getAmount());
        dto.setStartDate(budget.getStartDate().toString());
        dto.setEndDate(budget.getEndDate().toString());
        dto.setCollaborators(deserializeCollaborators(budget.getCollaborators()));
        return dto;
    }

    private String normalizeCollaborators(List<String> collaborators) {
        if (collaborators == null || collaborators.isEmpty()) {
            return ",";
        }
        return "," + collaborators.stream()
                .filter(email -> email != null && !email.trim().isEmpty())
                .map(String::trim)
                .distinct()
                .collect(Collectors.joining(",")) + ",";
    }

    private List<String> deserializeCollaborators(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split(","))
                .filter(token -> !token.isBlank())
                .collect(Collectors.toList());
    }
}
