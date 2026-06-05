package com.example.expensetracker.repository;

import com.example.expensetracker.model.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByPerformedByOrderByOccurredAtDesc(String performedBy);
    List<AuditLog> findAllByOrderByOccurredAtDesc();
}
