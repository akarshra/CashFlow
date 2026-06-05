package com.example.expensetracker.model.dto;

public class AiInsightDto {
    private String prompt;
    private String categorySuggestion;
    private String insight;

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getCategorySuggestion() {
        return categorySuggestion;
    }

    public void setCategorySuggestion(String categorySuggestion) {
        this.categorySuggestion = categorySuggestion;
    }

    public String getInsight() {
        return insight;
    }

    public void setInsight(String insight) {
        this.insight = insight;
    }
}
