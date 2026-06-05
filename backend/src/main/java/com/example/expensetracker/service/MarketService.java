package com.example.expensetracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

@Service
public class MarketService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ALPHAVANTAGE_API_KEY:}")
    private String alphaVantageKey;

    public Map<String, Double> fetchCryptoPrices(String[] ids) {
        // Use CoinGecko simple price API: https://api.coingecko.com/api/v3/simple/price
        String idsParam = String.join(",", ids);
        String url = "https://api.coingecko.com/api/v3/simple/price?ids=" + idsParam + "&vs_currencies=usd";
        ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(url, HttpMethod.GET, null,
                new ParameterizedTypeReference<>() {});
        Map<String, Object> response = resp.getBody();
        Map<String, Double> out = new HashMap<>();
        if (response != null) {
            for (String key : response.keySet()) {
                Object obj = response.get(key);
                if (obj instanceof Map) {
                    Object usd = ((Map<?, ?>) obj).get("usd");
                    if (usd instanceof Number) {
                        out.put(key, ((Number) usd).doubleValue());
                    }
                }
            }
        }
        return out;
    }

    public Double fetchStockPrice(String symbol) {
        // Use AlphaVantage TIME_SERIES_INTRADAY or GLOBAL_QUOTE. Here use GLOBAL_QUOTE.
        if (alphaVantageKey == null || alphaVantageKey.isBlank()) return null;
        String url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + symbol + "&apikey=" + alphaVantageKey;
        ResponseEntity<Map<String, Object>> respEntity = restTemplate.exchange(url, HttpMethod.GET, null,
                new ParameterizedTypeReference<>() {});
        Map<String, Object> resp = respEntity.getBody();
        if (resp != null && resp.containsKey("Global Quote")) {
            Object qobj = resp.get("Global Quote");
            Map<?, ?> quote = qobj instanceof Map ? (Map<?, ?>) qobj : Map.of();
            Object priceObj = quote.get("05. price");
            if (priceObj instanceof String) {
                try {
                    return Double.parseDouble((String) priceObj);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }
}
