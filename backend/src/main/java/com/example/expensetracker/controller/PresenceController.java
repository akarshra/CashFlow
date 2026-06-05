package com.example.expensetracker.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.util.Map;

@Controller
public class PresenceController {

    @MessageMapping("/presence/update")
    @SendTo("/topic/presence")
    public Map<String, Object> broadcastPresence(Map<String, Object> payload) {
        // Broadcast user's workspace, email, dynamic cell identifiers, or cursor locations to other active nodes
        return payload;
    }
}
