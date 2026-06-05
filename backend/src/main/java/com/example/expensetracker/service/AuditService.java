package com.example.expensetracker.service;

import com.example.expensetracker.model.AuditEvent;
import com.example.expensetracker.repository.AuditEventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    private final AuditEventRepository repository;

    public AuditService(AuditEventRepository repository) {
        this.repository = repository;
    }

    public AuditEvent record(String eventType, String username, String details) {
        AuditEvent ev = new AuditEvent(eventType, username, details);
        return repository.save(ev);
    }

    public List<AuditEvent> recent() {
        return repository.findTop100ByOrderByCreatedAtDesc();
    }
}
