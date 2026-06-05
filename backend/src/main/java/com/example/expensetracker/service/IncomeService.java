package com.example.expensetracker.service;

import com.example.expensetracker.model.dto.IncomeDto;
import com.example.expensetracker.model.entity.Income;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.IncomeRepository;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncomeService {
    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    public IncomeService(IncomeRepository incomeRepository, UserRepository userRepository) {
        this.incomeRepository = incomeRepository;
        this.userRepository = userRepository;
    }

    public List<IncomeDto> getIncomes(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return incomeRepository.findByUserId(user.getId()).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public IncomeDto addIncome(String email, IncomeDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Income income = new Income();
        income.setUser(user);
        income.setSource(dto.getSource());
        income.setAmount(dto.getAmount());
        income.setDate(dto.getDate());
        Income saved = incomeRepository.save(income);
        return mapToDto(saved);
    }

    private IncomeDto mapToDto(Income income) {
        IncomeDto dto = new IncomeDto();
        dto.setId(income.getId());
        dto.setSource(income.getSource());
        dto.setAmount(income.getAmount());
        dto.setDate(income.getDate());
        return dto;
    }
}
