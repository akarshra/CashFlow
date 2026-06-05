package com.example.expensetracker.controller;

import com.example.expensetracker.model.entity.User;
import com.example.expensetracker.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks/stripe")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final UserRepository userRepository;
    
    @Value("${STRIPE_WEBHOOK_SECRET:}")
    private String webhookSecret;

    public StripeWebhookController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
                                                @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        log.info("Received Stripe webhook notification event");
        
        if (webhookSecret == null || webhookSecret.isBlank()) {
            // Local dev simple signature bypass
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode rootNode = mapper.readTree(payload);
                String type = rootNode.path("type").asText();
                log.info("Processing Stripe event: {}", type);
                
                if ("checkout.session.completed".equals(type)) {
                    JsonNode dataObject = rootNode.path("data").path("object");
                    String email = dataObject.path("metadata").path("email").asText();
                    if (email == null || email.isBlank()) {
                        email = dataObject.path("customer_email").asText();
                    }
                    if (email != null && !email.isBlank()) {
                        User user = userRepository.findByEmail(email).orElse(null);
                        if (user != null) {
                            user.setPremium(true);
                            userRepository.save(user);
                            log.info("Stripe Webhook Sandbox: Upgraded user {} to Premium", email);
                        }
                    }
                }
                return ResponseEntity.ok("Received sandbox stripe hook successfully");
            } catch (Exception e) {
                log.error("Failed to parse sandbox Stripe payload", e);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error processing payload: " + e.getMessage());
            }
        }

        try {
            com.stripe.model.Event event = com.stripe.net.Webhook.constructEvent(payload, sigHeader, webhookSecret);
            log.info("Processing Stripe verified signature event: {}", event.getType());
            
            if ("checkout.session.completed".equals(event.getType())) {
                com.stripe.model.checkout.Session session = (com.stripe.model.checkout.Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null) {
                    String email = session.getMetadata().get("email");
                    if (email == null || email.isBlank()) {
                        email = session.getCustomerEmail();
                    }
                    if (email != null && !email.isBlank()) {
                        User user = userRepository.findByEmail(email).orElse(null);
                        if (user != null) {
                            user.setPremium(true);
                            userRepository.save(user);
                            log.info("Stripe Webhook Live: Upgraded user {} to Premium", email);
                        }
                    }
                }
            }
            return ResponseEntity.ok("Webhook completed");
        } catch (com.stripe.exception.SignatureVerificationException e) {
            log.error("Stripe signature validation failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Signature verification failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("Stripe webhook parsing failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        }
    }
}
