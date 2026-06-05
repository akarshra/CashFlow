package com.example.expensetracker.repository;

import com.example.expensetracker.model.entity.Workspace;
import com.example.expensetracker.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findByOwner(User owner);
}
