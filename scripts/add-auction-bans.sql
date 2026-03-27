-- Add auction participant bans table for admin moderation controls

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS auction_participant_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  banned_by_email VARCHAR(255) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_auction_participant_bans_product_id ON auction_participant_bans(product_id);
CREATE INDEX IF NOT EXISTS idx_auction_participant_bans_user_id ON auction_participant_bans(user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'update_auction_participant_bans_updated_at'
  ) THEN
    CREATE TRIGGER update_auction_participant_bans_updated_at
      BEFORE UPDATE ON auction_participant_bans
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
