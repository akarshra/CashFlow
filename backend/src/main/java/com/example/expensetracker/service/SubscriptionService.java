package com.example.expensetracker.service;

import com.example.expensetracker.model.dto.SubscriptionDto;
import com.example.expensetracker.model.entity.Subscription;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.SubscriptionRepository;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
    }

    public List<SubscriptionDto> getSubscriptions(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return subscriptionRepository.findByUserId(user.getId()).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SubscriptionDto addSubscription(String email, SubscriptionDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setName(dto.getName());
        sub.setAmount(dto.getAmount());
        sub.setCycle(dto.getCycle());
        sub.setNextBillingDate(dto.getNextBillingDate());
        Subscription saved = subscriptionRepository.save(sub);
        return mapToDto(saved);
    }

    private SubscriptionDto mapToDto(Subscription sub) {
        SubscriptionDto dto = new SubscriptionDto();
        dto.setId(sub.getId());
        dto.setName(sub.getName());
        dto.setAmount(sub.getAmount());
        dto.setCycle(sub.getCycle());
        dto.setNextBillingDate(sub.getNextBillingDate());
        return dto;
    }
}
