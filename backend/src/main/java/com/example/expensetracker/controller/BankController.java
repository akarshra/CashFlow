package com.example.expensetracker.controller;

import com.example.expensetracker.model.entity.BankTransaction;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.service.PlaidService;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bank")
public class BankController {

    private final PlaidService plaidService;
    private final UserRepository userRepository;

    public BankController(PlaidService plaidService, UserRepository userRepository) {
        this.plaidService = plaidService;
        this.userRepository = userRepository;
    }

    @PostMapping("/link-token")
    public ResponseEntity<Map<String, String>> createLinkToken(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        Map<String, String> token = plaidService.createLinkToken(user);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/exchange")
    public ResponseEntity<?> exchangePublicToken(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal,
                                                 @RequestBody Map<String, String> body) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        String publicToken = body.get("public_token");
        plaidService.exchangePublicToken(user, publicToken);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<BankTransaction>> listTransactions(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        List<BankTransaction> txs = plaidService.listTransactions(user);
        return ResponseEntity.ok(txs);
    }
}
