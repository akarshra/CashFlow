package com.example.expensetracker.service;

import com.example.expensetracker.model.dto.SavingsGoalDto;
import com.example.expensetracker.model.entity.SavingsGoal;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.SavingsGoalRepository;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SavingsGoalService {

    private final SavingsGoalRepository savingsGoalRepository;
    private final UserRepository userRepository;

    public SavingsGoalService(SavingsGoalRepository savingsGoalRepository, UserRepository userRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.userRepository = userRepository;
    }

    public List<SavingsGoalDto> list(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return savingsGoalRepository.findByUserId(user.getId()).stream().map(this::toDto).collect(Collectors.toList());
    }

    public SavingsGoalDto create(String userEmail, SavingsGoalDto dto) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        SavingsGoal goal = new SavingsGoal();
        goal.setUser(user);
        goal.setName(dto.getName());
        goal.setCategory(dto.getCategory());
        goal.setTargetAmount(BigDecimal.valueOf(dto.getTargetAmount() == null ? 0.0 : dto.getTargetAmount()));
        goal.setCurrentAmount(BigDecimal.valueOf(dto.getCurrentAmount() == null ? 0.0 : dto.getCurrentAmount()));
        return toDto(savingsGoalRepository.save(goal));
    }

    public SavingsGoalDto update(String userEmail, Long goalId, SavingsGoalDto dto) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Savings goal not found"));
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this goal");
        }
        goal.setName(dto.getName());
        goal.setCategory(dto.getCategory());
        goal.setTargetAmount(BigDecimal.valueOf(dto.getTargetAmount()));
        goal.setCurrentAmount(BigDecimal.valueOf(dto.getCurrentAmount()));
        return toDto(savingsGoalRepository.save(goal));
    }

    private SavingsGoalDto toDto(SavingsGoal goal) {
        SavingsGoalDto dto = new SavingsGoalDto();
        dto.setId(goal.getId());
        dto.setName(goal.getName());
        dto.setCategory(goal.getCategory());
        dto.setTargetAmount(goal.getTargetAmount() != null ? goal.getTargetAmount().doubleValue() : 0.0);
        dto.setCurrentAmount(goal.getCurrentAmount() != null ? goal.getCurrentAmount().doubleValue() : 0.0);
        return dto;
    }
}
