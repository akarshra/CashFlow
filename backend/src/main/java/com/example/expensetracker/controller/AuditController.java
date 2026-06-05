package com.example.expensetracker.controller;

import com.example.expensetracker.model.AuditEvent;
import com.example.expensetracker.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/audits")
    public ResponseEntity<List<AuditEvent>> recent() {
        return ResponseEntity.ok(auditService.recent());
    }
}
