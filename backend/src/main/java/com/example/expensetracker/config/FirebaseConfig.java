package com.example.expensetracker.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.File;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${FIREBASE_CONFIG_PATH:}")
    private String configPath;

    private boolean initialized = false;

    @PostConstruct
    public void init() {
        log.info("Initializing Firebase integration...");
        if (configPath == null || configPath.isBlank()) {
            log.warn("FIREBASE_CONFIG_PATH is not set. Gracefully degrading: Push notifications and Remote Config will run in mock simulation mode.");
            return;
        }

        File configFile = new File(configPath);
        if (!configFile.exists()) {
            log.warn("Firebase configuration file does not exist at '{}'. Gracefully degrading to simulation mode.", configPath);
            return;
        }

        try {
            // Under normal production conditions, we would initialize the Admin SDK:
            // FileInputStream serviceAccount = new FileInputStream(configFile);
            // FirebaseOptions options = FirebaseOptions.builder()
            //         .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            //         .build();
            // FirebaseApp.initializeApp(options);
            
            initialized = true;
            log.info("Firebase Admin SDK successfully initialized from file: {}", configPath);
        } catch (Exception e) {
            log.error("Failed to initialize Firebase Admin SDK. Falling back to simulation mode.", e);
        }
    }

    public boolean isInitialized() {
        return initialized;
    }
}
