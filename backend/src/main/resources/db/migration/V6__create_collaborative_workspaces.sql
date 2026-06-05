-- Create collaborative workspaces, members, invitations, and audit_event tables for SaaS compliance

CREATE TABLE IF NOT EXISTS workspaces (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id BIGINT REFERENCES users(id) NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_members (
    id BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_invitations (
    id BIGSERIAL PRIMARY KEY,
    workspace_id BIGINT REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    accepted BOOLEAN DEFAULT FALSE NOT NULL,
    expired_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_event (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    details VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
