package com.example.expensetracker.service;

import com.example.expensetracker.model.entity.Holding;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.HoldingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortfolioService {

    private final HoldingRepository holdingRepository;

    public PortfolioService(HoldingRepository holdingRepository) {
        this.holdingRepository = holdingRepository;
    }

    public List<Holding> listHoldings(User user) {
        return holdingRepository.findByUser(user);
    }

    public Holding addHolding(Holding h) {
        return holdingRepository.save(h);
    }
}
