package com.example.expensetracker.model.dto;

import java.time.LocalDate;

public class SubscriptionDto {
    private Long id;
    private String name;
    private Double amount;
    private String cycle;
    private LocalDate nextBillingDate;

    public SubscriptionDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getCycle() { return cycle; }
    public void setCycle(String cycle) { this.cycle = cycle; }
    public LocalDate getNextBillingDate() { return nextBillingDate; }
    public void setNextBillingDate(LocalDate nextBillingDate) { this.nextBillingDate = nextBillingDate; }
}
