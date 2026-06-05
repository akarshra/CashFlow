-- Create tables for bank accounts and transactions
CREATE TABLE IF NOT EXISTS bank_accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  provider VARCHAR(100) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  mask VARCHAR(32),
  type VARCHAR(64),
  access_token VARCHAR(1024),
  CONSTRAINT fk_bank_account_user FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  bank_account_id BIGINT NOT NULL,
  description VARCHAR(1024) NOT NULL,
  amount NUMERIC NOT NULL,
  transaction_date DATE NOT NULL,
  category VARCHAR(255),
  CONSTRAINT fk_bank_tx_user FOREIGN KEY(user_id) REFERENCES users(id),
  CONSTRAINT fk_bank_tx_account FOREIGN KEY(bank_account_id) REFERENCES bank_accounts(id)
);
