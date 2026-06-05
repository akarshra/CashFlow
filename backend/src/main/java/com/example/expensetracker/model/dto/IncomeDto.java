package com.example.expensetracker.model.dto;

import java.time.LocalDate;

public class IncomeDto {
    private Long id;
    private String source;
    private Double amount;
    private LocalDate date;

    public IncomeDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
