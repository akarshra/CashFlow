package com.example.expensetracker.service;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {

    @Value("${STRIPE_SECRET_KEY:sk_test_51MockSecretKeyPlaceholder}")
    private String stripeSecretKey;

    @Value("${STRIPE_PRICE_ID:}")
    private String stripePriceId;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public Map<String, String> createCheckoutSession(String userEmail, String successUrl, String cancelUrl) {
        if (stripeSecretKey == null || stripeSecretKey.contains("MockSecretKeyPlaceholder") || stripeSecretKey.isBlank()) {
            Map<String, String> response = new HashMap<>();
            response.put("sessionId", "mock_session_id_" + System.currentTimeMillis());
            response.put("url", successUrl);
            return response;
        }
        try {
            SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(cancelUrl)
                    .setCustomerEmail(userEmail);

            // If a specific price ID is not provided, dynamically build the price item
            if (stripePriceId != null && !stripePriceId.isBlank()) {
                paramsBuilder.addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(stripePriceId)
                                .setQuantity(1L)
                                .build()
                );
            } else {
                paramsBuilder.addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("inr")
                                                .setUnitAmount(99900L) // ₹999.00 in paise
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("CashFlow Enterprise Premium Membership")
                                                                .setDescription("Unlocks interactive 3D visualizations, multi-currency wallets, automated Gemini-powered OCR and advanced predictive forecasting.")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                );
            }

            paramsBuilder.putMetadata("email", userEmail);

            Session session = Session.create(paramsBuilder.build());
            
            Map<String, String> response = new HashMap<>();
            response.put("sessionId", session.getId());
            response.put("url", session.getUrl());
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Stripe checkout session", e);
        }
    }
}
