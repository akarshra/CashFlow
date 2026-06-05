package com.example.expensetracker.controller;

import com.example.expensetracker.model.entity.Workspace;
import com.example.expensetracker.model.entity.Invitation;
import com.example.expensetracker.service.WorkspaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public ResponseEntity<List<Workspace>> listWorkspaces(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(workspaceService.getWorkspaces(user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<Workspace> createWorkspace(@AuthenticationPrincipal UserDetails user,
                                                     @RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Workspace name is required");
        }
        return ResponseEntity.ok(workspaceService.createWorkspace(user.getUsername(), name));
    }

    @PostMapping("/{workspaceId}/invite")
    public ResponseEntity<Invitation> inviteUser(@AuthenticationPrincipal UserDetails user,
                                                 @PathVariable Long workspaceId,
                                                 @RequestBody Map<String, String> body) {
        String email = body.get("email");
        String role = body.getOrDefault("role", "VIEWER");
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Invitee email is required");
        }
        return ResponseEntity.ok(workspaceService.inviteUser(user.getUsername(), workspaceId, email, role));
    }

    @PostMapping("/accept")
    public ResponseEntity<Map<String, String>> acceptInvitation(@AuthenticationPrincipal UserDetails user,
                                                                @RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Token is required to accept invitation");
        }
        workspaceService.acceptInvitation(user.getUsername(), token);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Invitation accepted successfully"));
    }
}
