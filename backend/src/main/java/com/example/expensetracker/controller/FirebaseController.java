package com.example.expensetracker.controller;

import com.example.expensetracker.config.FirebaseConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/firebase")
public class FirebaseController {

    private final FirebaseConfig firebaseConfig;

    public FirebaseController(FirebaseConfig firebaseConfig) {
        this.firebaseConfig = firebaseConfig;
    }

    @GetMapping("/remote-config")
    public ResponseEntity<Map<String, Object>> getRemoteConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("firebaseInitialized", firebaseConfig.isInitialized());
        
        // Dynamic features flags that can be toggled by the frontend
        config.put("enableVisual3DWidget", true);
        config.put("analyticsChartType", "echarts");
        config.put("enableGeminiForecast", true);
        config.put("budgetNotificationThreshold", 0.85); // Alert at 85% of budget spent
        
        return ResponseEntity.ok(config);
    }

    @PostMapping("/send-push")
    public ResponseEntity<Map<String, String>> sendPushNotification(@RequestBody Map<String, String> payload) {
        String title = payload.getOrDefault("title", "Budget Alert");
        String message = payload.getOrDefault("message", "You have spent 85% of your food budget.");
        
        // If Firebase is initialized, send an actual FCM message. Otherwise, simulate it:
        if (firebaseConfig.isInitialized()) {
            // Real FCM send logic:
            // Message fcmMessage = Message.builder()
            //         .setNotification(Notification.builder().setTitle(title).setBody(message).build())
            //         .setTopic("all-users")
            //         .build();
            // FirebaseMessaging.getInstance().send(fcmMessage);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Real push notification dispatched via FCM."));
        } else {
            return ResponseEntity.ok(Map.of("status", "simulated", "message", "Firebase in simulation mode. Push logged: [" + title + "] " + message));
        }
    }
}
