CREATE TABLE IF NOT EXISTS webauthn_credentials (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    credential_id VARCHAR(255) NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    sign_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cryptographic_signatures (
    id BIGSERIAL PRIMARY KEY,
    statement_hash VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    public_key_pem TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_valid BOOLEAN DEFAULT TRUE
);
