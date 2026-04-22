-- Safe migration for adding auction_history table to existing databases
-- Run this for databases already provisioned before auction_history existed.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS auction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  product_image_url TEXT,
  product_category VARCHAR(64),
  seller_user_id UUID,
  seller_email VARCHAR(255),
  conducted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  auction_end_time TIMESTAMP,
  winner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  winner_email VARCHAR(255),
  winning_bid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('full', 'penalty')),
  outcome_status VARCHAR(30) NOT NULL DEFAULT 'completed' CHECK (outcome_status IN ('completed', 'penalty_paid', 'relisted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (product_id, payment_type)
);

CREATE INDEX IF NOT EXISTS idx_auction_history_conducted_at ON auction_history(conducted_at);
CREATE INDEX IF NOT EXISTS idx_auction_history_winner_user_id ON auction_history(winner_user_id);
CREATE INDEX IF NOT EXISTS idx_auction_history_product_id ON auction_history(product_id);

ALTER TABLE auction_history
DROP CONSTRAINT IF EXISTS auction_history_product_id_fkey;

ALTER TABLE auction_history
ADD COLUMN IF NOT EXISTS product_category VARCHAR(64),
ADD COLUMN IF NOT EXISTS seller_user_id UUID,
ADD COLUMN IF NOT EXISTS seller_email VARCHAR(255);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_auction_history_updated_at ON auction_history;
CREATE TRIGGER update_auction_history_updated_at BEFORE UPDATE ON auction_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
