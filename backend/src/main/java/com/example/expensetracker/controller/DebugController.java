package com.example.expensetracker.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@Profile("dev")
public class DebugController {

    @GetMapping("/plaid")
    public ResponseEntity<Map<String, String>> plaidInfo() {
        String client = System.getenv("PLAID_CLIENT_ID");
        String secret = System.getenv("PLAID_SECRET");
        String env = System.getenv().getOrDefault("PLAID_ENV", "sandbox");
        boolean configured = client != null && !client.isBlank() && secret != null && !secret.isBlank();
        String masked = "";
        if (client != null) {
            masked = client.length() > 4 ? "****" + client.substring(client.length() - 4) : client;
        }
        return ResponseEntity.ok(Map.of(
                "configured", Boolean.toString(configured),
                "env", env,
                "client_masked", masked
        ));
    }
}
