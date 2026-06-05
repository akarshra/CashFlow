package com.example.expensetracker.repository;

import com.example.expensetracker.model.entity.BankAccount;
import com.example.expensetracker.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    List<BankAccount> findByUser(User user);
}
