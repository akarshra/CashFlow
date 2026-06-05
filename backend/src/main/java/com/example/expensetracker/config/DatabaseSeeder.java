package com.example.expensetracker.config;

import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "akarshsrivastava322@gmail.com";
        
        // Seed administrative credentials if they don't already exist inside the DB bounds
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            User admin = new User();
            admin.setFirstName("Akarsh");
            admin.setLastName("Srivastava");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("kumar123"));
            admin.setPremium(true); // Grant premium indicator by default
            userRepository.save(admin);
            System.out.println(">>> Database Seeded: Default Admin User (" + adminEmail + ") created successfully.");
        }
    }
}
