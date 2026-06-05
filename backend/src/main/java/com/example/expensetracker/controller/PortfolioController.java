package com.example.expensetracker.controller;

import com.example.expensetracker.model.entity.Holding;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.service.MarketService;
import com.example.expensetracker.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final UserRepository userRepository;
    private final MarketService marketService;

    public PortfolioController(PortfolioService portfolioService, UserRepository userRepository, MarketService marketService) {
        this.portfolioService = portfolioService;
        this.userRepository = userRepository;
        this.marketService = marketService;
    }

    @GetMapping("/holdings")
    public ResponseEntity<List<Holding>> listHoldings(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        List<Holding> holdings = portfolioService.listHoldings(user);
        return ResponseEntity.ok(holdings);
    }

    @PostMapping("/holdings")
    public ResponseEntity<Holding> addHolding(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
                                              @RequestBody Holding dto) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        dto.setUser(user);
        Holding saved = portfolioService.addHolding(dto);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/prices")
    public ResponseEntity<Map<String, Double>> fetchPrices(@RequestBody Map<String, Object> body) {
        List<String> crypto = toStringList(body.get("crypto"));
        List<String> stocks = toStringList(body.get("stocks"));
        Map<String, Double> out = new HashMap<>();
        if (!crypto.isEmpty()) {
            String[] ids = crypto.toArray(new String[0]);
            out.putAll(marketService.fetchCryptoPrices(ids));
        }
        if (!stocks.isEmpty()) {
            for (String s : stocks) {
                Double p = marketService.fetchStockPrice(s);
                if (p != null) out.put(s, p);
            }
        }
        return ResponseEntity.ok(out);
    }

    private List<String> toStringList(Object obj) {
        if (obj instanceof List<?>) {
            List<?> raw = (List<?>) obj;
            List<String> out = new ArrayList<>();
            for (Object o : raw) {
                if (o != null) out.add(o.toString());
            }
            return out;
        }
        return Collections.emptyList();
    }
}
