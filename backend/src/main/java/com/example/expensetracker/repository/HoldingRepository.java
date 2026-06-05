package com.example.expensetracker.repository;

import com.example.expensetracker.model.entity.Holding;
import com.example.expensetracker.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HoldingRepository extends JpaRepository<Holding, Long> {
    List<Holding> findByUser(User user);
}
