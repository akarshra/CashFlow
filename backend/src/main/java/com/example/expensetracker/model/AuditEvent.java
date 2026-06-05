package com.example.expensetracker.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_event")
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventType;

    private String username;

    @Column(length = 2000)
    private String details;

    private Instant createdAt;

    public AuditEvent() {}

    public AuditEvent(String eventType, String username, String details) {
        this.eventType = eventType;
        this.username = username;
        this.details = details;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
