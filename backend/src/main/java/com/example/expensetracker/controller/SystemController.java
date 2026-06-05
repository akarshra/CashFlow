package com.example.expensetracker.controller;

import com.example.expensetracker.service.AdminSystemControlService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final AdminSystemControlService adminControlService;

    public SystemController(AdminSystemControlService adminControlService) {
        this.adminControlService = adminControlService;
    }

    @GetMapping("/announcement")
    public ResponseEntity<Map<String, String>> getAnnouncement() {
        return ResponseEntity.ok(Map.of("announcement", adminControlService.getActiveAnnouncement()));
    }

    @GetMapping("/features")
    public ResponseEntity<Map<String, Boolean>> getFeatures() {
        return ResponseEntity.ok(adminControlService.getFeatureFlags());
    }
}
