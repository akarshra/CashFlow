package com.example.expensetracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class CurrencyService {

    private final WebClient webClient;

    public CurrencyService(@Value("${currency.api.url:https://api.exchangerate.host}") String apiUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .build();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Double> getLatestRates(String baseCurrency) {
        try {
            Map<String, Object> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/latest")
                            .queryParam("base", baseCurrency)
                            .queryParam("symbols", "USD,EUR,GBP,INR")
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null || !response.containsKey("rates")) {
                return defaultRates();
            }

            Object rawRates = response.get("rates");
            if (!(rawRates instanceof Map)) {
                return defaultRates();
            }

            Map<String, Object> rateMap = (Map<String, Object>) rawRates;
            Map<String, Double> result = new HashMap<>();
            rateMap.forEach((key, value) -> {
                try {
                    result.put(key, Double.parseDouble(value.toString()));
                } catch (Exception ex) {
                    // ignore invalid values
                }
            });
            return result;
        } catch (Exception ex) {
            return defaultRates();
        }
    }

    private Map<String, Double> defaultRates() {
        Map<String, Double> defaults = new HashMap<>();
        defaults.put("USD", 1.0);
        defaults.put("EUR", 0.92);
        defaults.put("GBP", 0.80);
        defaults.put("INR", 83.0);
        return defaults;
    }
}
