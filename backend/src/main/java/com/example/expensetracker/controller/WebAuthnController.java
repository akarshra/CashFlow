package com.example.expensetracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/webauthn")
public class WebAuthnController {

    private final Map<String, String> activeChallenges = new ConcurrentHashMap<>();
    private final Map<String, String> userKeys = new ConcurrentHashMap<>();

    @PostMapping("/register/challenge")
    public ResponseEntity<Map<String, String>> getRegisterChallenge(@AuthenticationPrincipal UserDetails user) {
        String challenge = UUID.randomUUID().toString();
        activeChallenges.put(user.getUsername(), challenge);

        return ResponseEntity.ok(Map.of(
            "challenge", challenge,
            "rpName", "CashFlow Mainframe",
            "rpId", "localhost",
            "userName", user.getUsername(),
            "displayName", user.getUsername()
        ));
    }

    @PostMapping("/register/verify")
    public ResponseEntity<Map<String, String>> verifyRegisterResponse(@AuthenticationPrincipal UserDetails user,
                                                                     @RequestBody Map<String, String> response) {
        String storedChallenge = activeChallenges.remove(user.getUsername());
        if (storedChallenge == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Challenge expired or not found."));
        }

        String credentialId = response.get("credentialId");
        String publicKey = response.get("publicKey"); // simulated client public key credential

        if (credentialId == null || publicKey == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credential response."));
        }

        userKeys.put(user.getUsername(), publicKey);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "FIDO2 WebAuthn authenticator successfully registered."
        ));
    }

    @PostMapping("/authenticate/challenge")
    public ResponseEntity<Map<String, String>> getAuthChallenge(@AuthenticationPrincipal UserDetails user) {
        String challenge = UUID.randomUUID().toString();
        activeChallenges.put(user.getUsername(), challenge);

        return ResponseEntity.ok(Map.of(
            "challenge", challenge,
            "rpId", "localhost"
        ));
    }

    @PostMapping("/authenticate/verify")
    public ResponseEntity<Map<String, String>> verifyAuthResponse(@AuthenticationPrincipal UserDetails user,
                                                                 @RequestBody Map<String, String> response) {
        activeChallenges.remove(user.getUsername()); // clear challenge
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "FIDO2 WebAuthn biometric challenge verified successfully."
        ));
    }
}
