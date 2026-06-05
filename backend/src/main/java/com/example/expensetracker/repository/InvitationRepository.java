package com.example.expensetracker.repository;

import com.example.expensetracker.model.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    Optional<Invitation> findByToken(String token);
    List<Invitation> findByEmail(String email);
}
