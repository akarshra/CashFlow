-- Create holdings table for portfolio tracking
CREATE TABLE IF NOT EXISTS holdings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  symbol VARCHAR(64) NOT NULL,
  asset_type VARCHAR(32) NOT NULL,
  quantity NUMERIC NOT NULL,
  avg_price NUMERIC,
  currency VARCHAR(16),
  CONSTRAINT fk_holdings_user FOREIGN KEY(user_id) REFERENCES users(id)
);
