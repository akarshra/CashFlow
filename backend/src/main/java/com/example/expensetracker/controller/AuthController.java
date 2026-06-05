package com.example.expensetracker.controller;

import com.example.expensetracker.model.dto.AuthRequest;
import com.example.expensetracker.model.dto.AuthResponse;
import com.example.expensetracker.service.AuthService;
import com.example.expensetracker.service.AuditService;
import com.example.expensetracker.util.InputSanitizer;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final AuditService auditService;

    public AuthController(AuthService authService, AuditService auditService) {
        this.authService = authService;
        this.auditService = auditService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        // sanitize inputs
        request.setFirstName(InputSanitizer.sanitize(request.getFirstName()));
        request.setLastName(InputSanitizer.sanitize(request.getLastName()));
        request.setEmail(InputSanitizer.sanitize(request.getEmail()));
        // password should not be modified but trimmed
        if (request.getPassword() != null) request.setPassword(request.getPassword().trim());

        AuthResponse resp = authService.register(request);
        // record audit event
        auditService.record("USER_REGISTER", request.getEmail(), "User registered: " + request.getEmail());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        request.setEmail(InputSanitizer.sanitize(request.getEmail()));
        if (request.getPassword() != null) request.setPassword(request.getPassword().trim());
        AuthResponse resp = authService.login(request);
        auditService.record("USER_LOGIN", request.getEmail(), "User login attempt: " + request.getEmail());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/social-login")
    public ResponseEntity<AuthResponse> socialLogin(@Valid @RequestBody com.example.expensetracker.model.dto.SocialAuthRequest request) {
        request.setEmail(InputSanitizer.sanitize(request.getEmail()));
        if (request.getFirstName() != null) request.setFirstName(InputSanitizer.sanitize(request.getFirstName()));
        if (request.getLastName() != null) request.setLastName(InputSanitizer.sanitize(request.getLastName()));
        
        AuthResponse resp = authService.socialLogin(request);
        auditService.record("USER_SOCIAL_LOGIN", request.getEmail(), "User social login (" + request.getProvider() + "): " + request.getEmail());
        return ResponseEntity.ok(resp);
    }
}
