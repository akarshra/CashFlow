package com.example.expensetracker.repository;

import com.example.expensetracker.model.entity.WorkspaceMember;
import com.example.expensetracker.model.entity.Workspace;
import com.example.expensetracker.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {
    List<WorkspaceMember> findByWorkspace(Workspace workspace);
    List<WorkspaceMember> findByUser(User user);
    Optional<WorkspaceMember> findByWorkspaceAndUser(Workspace workspace, User user);
}
