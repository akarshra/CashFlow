package com.example.expensetracker.service;

import com.example.expensetracker.model.entity.*;
import com.example.expensetracker.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class WorkspaceService {

    private static final Logger log = LoggerFactory.getLogger(WorkspaceService.class);

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public WorkspaceService(WorkspaceRepository workspaceRepository,
                            WorkspaceMemberRepository workspaceMemberRepository,
                            InvitationRepository invitationRepository,
                            UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Workspace createWorkspace(String ownerEmail, String name) {
        User owner = userRepository.findByEmail(ownerEmail).orElseThrow(() -> new RuntimeException("User not found"));
        
        Workspace workspace = new Workspace();
        workspace.setName(name);
        workspace.setOwner(owner);
        workspace = workspaceRepository.save(workspace);

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(workspace);
        member.setUser(owner);
        member.setRole("OWNER");
        workspaceMemberRepository.save(member);

        log.info("Created collaborative workspace '{}' for owner {}", name, ownerEmail);
        return workspace;
    }

    @Transactional
    public Invitation inviteUser(String ownerEmail, Long workspaceId, String inviteeEmail, String role) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        
        if (!workspace.getOwner().getEmail().equals(ownerEmail)) {
            throw new RuntimeException("Unauthorized: Only workspace owner can invite members");
        }

        String token = UUID.randomUUID().toString();
        Invitation invitation = new Invitation();
        invitation.setWorkspace(workspace);
        invitation.setEmail(inviteeEmail);
        invitation.setToken(token);
        invitation.setRole(role != null ? role.toUpperCase() : "VIEWER");
        invitation.setExpiredAt(LocalDateTime.now().plusDays(7));
        invitation = invitationRepository.save(invitation);

        String activationLink = "http://localhost:4200/workspaces/accept?token=" + token;
        log.info("Created workspace invitation for {} in workspace '{}' (Role={})", inviteeEmail, workspace.getName(), role);
        log.info("Sandbox activation token link: {}", activationLink);

        sendInviteEmail(inviteeEmail, workspace.getName(), activationLink);

        return invitation;
    }

    @Transactional
    public void acceptInvitation(String email, String token) {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invitation token is invalid"));

        if (invitation.isAccepted()) {
            throw new RuntimeException("Invitation has already been accepted");
        }

        if (invitation.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invitation token has expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User must be registered to accept invitations"));

        invitation.setAccepted(true);
        invitationRepository.save(invitation);

        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(invitation.getWorkspace());
        member.setUser(user);
        member.setRole(invitation.getRole());
        workspaceMemberRepository.save(member);

        log.info("User {} accepted invitation for workspace '{}' with role {}", email, invitation.getWorkspace().getName(), invitation.getRole());
    }

    public List<Workspace> getWorkspaces(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        List<WorkspaceMember> memberships = workspaceMemberRepository.findByUser(user);
        List<Workspace> workspaces = new ArrayList<>();
        for (WorkspaceMember member : memberships) {
            workspaces.add(member.getWorkspace());
        }
        return workspaces;
    }

    private void sendInviteEmail(String toEmail, String workspaceName, String link) {
        if (mailSender == null) {
            log.warn("JavaMailSender is not configured. Email dispatch bypassed. Invite link logged above.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Collaborative Workspace Invite - CashFlow Enterprise");
            message.setText("You have been invited to join the collaborative workspace '" + workspaceName + "' on CashFlow Enterprise.\n\n"
                    + "Please click the link below to accept the invitation and begin collaborating:\n"
                    + link + "\n\n"
                    + "Best regards,\nThe CashFlow Team");
            mailSender.send(message);
            log.info("Successfully dispatched SMTP invitation email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send SMTP email to {}, falling back to log activation link", toEmail, e);
        }
    }
}
