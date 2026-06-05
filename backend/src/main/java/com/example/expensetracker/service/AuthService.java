package com.example.expensetracker.service;

import com.example.expensetracker.model.dto.AuthRequest;
import com.example.expensetracker.model.dto.AuthResponse;
import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse register(AuthRequest request) {
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        if (request.getFirstName().length() > 50) {
            throw new IllegalArgumentException("First name must be at most 50 characters");
        }
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        if (request.getLastName().length() > 50) {
            throw new IllegalArgumentException("Last name must be at most 50 characters");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return new AuthResponse(tokenProvider.createToken(user.getEmail()), user.isPremium());
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return new AuthResponse(tokenProvider.createToken(user.getEmail()), user.isPremium());
    }

    public AuthResponse socialLogin(com.example.expensetracker.model.dto.SocialAuthRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(request.getEmail());
            user.setFirstName(request.getFirstName() != null && !request.getFirstName().trim().isEmpty() ? request.getFirstName() : "SSO");
            user.setLastName(request.getLastName() != null && !request.getLastName().trim().isEmpty() ? request.getLastName() : "User");
            user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString() + "_sso_secure"));
            userRepository.save(user);
        }

        return new AuthResponse(tokenProvider.createToken(user.getEmail()), user.isPremium());
    }
}
