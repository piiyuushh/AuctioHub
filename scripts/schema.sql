-- AuctioHub PostgreSQL Database Schema
-- Run this file in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) DEFAULT '',
  image TEXT DEFAULT '',
  role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ==================== CAROUSEL IMAGES TABLE ====================
CREATE TABLE IF NOT EXISTS carousel_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  cloudinary_public_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_carousel_images_order ON carousel_images("order");
CREATE INDEX IF NOT EXISTS idx_carousel_images_is_active ON carousel_images(is_active);

-- ==================== NEW ARRIVALS TABLE ====================
CREATE TABLE IF NOT EXISTS new_arrivals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link VARCHAR(255) DEFAULT '/category',
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_new_arrivals_order ON new_arrivals("order");
CREATE INDEX IF NOT EXISTS idx_new_arrivals_is_active ON new_arrivals(is_active);

-- ==================== ADMIN SETTINGS TABLE ====================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

-- ==================== PRODUCTS TABLE ====================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  cloudinary_public_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  has_auction BOOLEAN DEFAULT false,
  auction_end_time TIMESTAMP,
  starting_bid DECIMAL(10, 2) DEFAULT 0,
  current_bid DECIMAL(10, 2) DEFAULT 0,
  highest_bidder UUID REFERENCES users(id) ON DELETE SET NULL,
  highest_bidder_email VARCHAR(255),
  total_bids INTEGER DEFAULT 0,
  auction_status VARCHAR(20) DEFAULT 'none' CHECK (auction_status IN ('active', 'ended', 'none')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_email ON products(user_email);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_has_auction ON products(has_auction);
CREATE INDEX IF NOT EXISTS idx_products_auction_status ON products(auction_status);
CREATE INDEX IF NOT EXISTS idx_products_auction_end_time ON products(auction_end_time);

-- ==================== BIDS TABLE ====================
CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  bid_amount DECIMAL(10, 2) NOT NULL,
  is_winning BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bids_product_id ON bids(product_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_is_winning ON bids(is_winning);
CREATE INDEX IF NOT EXISTS idx_bids_is_active ON bids(is_active);

-- ==================== AUCTION PARTICIPANT BANS TABLE ====================
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

-- ==================== CHAT MESSAGES TABLE ====================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_product_id ON chat_messages(product_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- ==================== AUCTION HISTORY TABLE ====================
CREATE TABLE IF NOT EXISTS auction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_title VARCHAR(255) NOT NULL,
  product_image_url TEXT,
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

-- ==================== TRIGGERS FOR UPDATED_AT ====================
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carousel_images_updated_at BEFORE UPDATE ON carousel_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_new_arrivals_updated_at BEFORE UPDATE ON new_arrivals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auction_participant_bans_updated_at BEFORE UPDATE ON auction_participant_bans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auction_history_updated_at BEFORE UPDATE ON auction_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
