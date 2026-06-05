package com.example.expensetracker.service;

import com.example.expensetracker.model.dto.ExpenseDto;
import com.example.expensetracker.model.entity.Category;
import com.example.expensetracker.model.entity.Expense;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ExpenseService(ExpenseRepository expenseRepository, 
                          UserRepository userRepository, 
                          CategoryRepository categoryRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<ExpenseDto> list(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return expenseRepository.findByUser(user).stream().map(this::toDto).collect(Collectors.toList());
    }

    public ExpenseDto create(String userEmail, ExpenseDto dto) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Category category = categoryRepository.findById(dto.getCategoryId()).orElseThrow();
        Expense expense = new Expense();
        expense.setUser(user);
        expense.setCategory(category);
        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setOccurredAt(LocalDate.parse(dto.getOccurredAt()));
        expenseRepository.save(expense);
        
        ExpenseDto result = toDto(expense);
        try {
            messagingTemplate.convertAndSend("/topic/expenses", Map.of("action", "create", "expense", result, "user", userEmail));
        } catch (Exception e) {
            // Log & ignore to prevent transaction rollback if websocket broadcast fails
        }
        return result;
    }

    public ExpenseDto update(String userEmail, Long expenseId, ExpenseDto dto) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Expense expense = expenseRepository.findByIdAndUser(expenseId, user).orElseThrow();
        Category category = categoryRepository.findById(dto.getCategoryId()).orElseThrow();
        expense.setCategory(category);
        expense.setDescription(dto.getDescription());
        expense.setAmount(dto.getAmount());
        expense.setOccurredAt(LocalDate.parse(dto.getOccurredAt()));
        expenseRepository.save(expense);
        
        ExpenseDto result = toDto(expense);
        try {
            messagingTemplate.convertAndSend("/topic/expenses", Map.of("action", "update", "expense", result, "user", userEmail));
        } catch (Exception e) {
            // Log & ignore
        }
        return result;
    }

    public void delete(String userEmail, Long expenseId) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Expense expense = expenseRepository.findByIdAndUser(expenseId, user).orElseThrow();
        expenseRepository.delete(expense);
        try {
            messagingTemplate.convertAndSend("/topic/expenses", Map.of("action", "delete", "expenseId", expenseId, "user", userEmail));
        } catch (Exception e) {
            // Log & ignore
        }
    }

    private ExpenseDto toDto(Expense expense) {
        ExpenseDto dto = new ExpenseDto();
        dto.setId(expense.getId());
        dto.setCategoryId(expense.getCategory().getId());
        dto.setDescription(expense.getDescription());
        dto.setAmount(expense.getAmount());
        dto.setOccurredAt(expense.getOccurredAt().toString());
        return dto;
    }
}

