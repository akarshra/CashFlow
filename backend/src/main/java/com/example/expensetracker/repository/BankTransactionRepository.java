package com.example.expensetracker.repository;

import com.example.expensetracker.model.entity.BankTransaction;
import com.example.expensetracker.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {
    List<BankTransaction> findByUser(User user);
}
