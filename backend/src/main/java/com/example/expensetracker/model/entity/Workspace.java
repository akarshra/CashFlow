package com.example.expensetracker.model.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "workspaces")
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WorkspaceMember> members = new HashSet<>();

    public Workspace() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Set<WorkspaceMember> getMembers() {
        return members;
    }

    public void setMembers(Set<WorkspaceMember> members) {
        this.members = members;
    }

    @Column(name = "storage_capacity_gb")
    private Integer storageCapacityGb = 10;

    @Column(name = "is_frozen")
    private Boolean isFrozen = false;

    public Integer getStorageCapacityGb() {
        return storageCapacityGb != null ? storageCapacityGb : 10;
    }

    public void setStorageCapacityGb(Integer storageCapacityGb) {
        this.storageCapacityGb = storageCapacityGb;
    }

    public Boolean getIsFrozen() {
        return isFrozen != null ? isFrozen : false;
    }

    public void setIsFrozen(Boolean isFrozen) {
        this.isFrozen = isFrozen;
    }
}
