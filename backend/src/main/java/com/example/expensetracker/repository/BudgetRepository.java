package com.example.expensetracker.repository;

import com.example.expensetracker.model.entity.Budget;
import com.example.expensetracker.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUser(User user);
    List<Budget> findByUserOrCollaboratorsContaining(User user, String collaborators);
}
