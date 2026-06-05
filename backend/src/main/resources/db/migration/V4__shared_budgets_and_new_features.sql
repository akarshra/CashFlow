-- Add shared collaborator support for budgets
ALTER TABLE budgets ADD COLUMN collaborators TEXT;

-- Create invoices table for billing and PDF generation
CREATE TABLE IF NOT EXISTS invoice (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    amount NUMERIC(19,2),
    due_date DATE,
    status VARCHAR(50),
    description TEXT
);

-- Create savings goals table for gamified goal tracking
CREATE TABLE IF NOT EXISTS savings_goal (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    name VARCHAR(255),
    category VARCHAR(255),
    target_amount NUMERIC(19,2),
    current_amount NUMERIC(19,2)
);
