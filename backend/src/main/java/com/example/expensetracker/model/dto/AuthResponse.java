package com.example.expensetracker.model.dto;

public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private boolean isPremium;

    public AuthResponse(String accessToken, boolean isPremium) {
        this.accessToken = accessToken;
        this.isPremium = isPremium;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public boolean isPremium() {
        return isPremium;
    }

    public void setPremium(boolean premium) {
        this.isPremium = premium;
    }
}
