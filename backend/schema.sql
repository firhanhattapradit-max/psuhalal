-- ==========================================
-- Smart Halal Mobility & Tourism Platform
-- Database Schema (PostgreSQL + PostGIS)
-- ==========================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================
-- 2. ENUM Types
-- ==========================================
CREATE TYPE user_role AS ENUM ('passenger', 'driver', 'merchant', 'admin');
CREATE TYPE language_code AS ENUM ('TH', 'MS', 'EN', 'AR');
CREATE TYPE vehicle_type AS ENUM ('van', 'train', 'songthaew', 'ev_shuttle');
CREATE TYPE vehicle_status AS ENUM ('active', 'maintenance', 'offline');
CREATE TYPE poi_category AS ENUM ('mosque', 'halal_restaurant', 'station', 'tourism_spot', 'prayer_room');
CREATE TYPE reward_category AS ENUM ('mobility', 'gastronomy', 'craft', 'sadaqah');
CREATE TYPE redemption_status AS ENUM ('pending', 'redeemed', 'expired');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_currency AS ENUM ('THB', 'MYR');
CREATE TYPE checkin_method AS ENUM ('qr_code', 'geofence', 'manual_admin');

-- ==========================================
-- 3. Tables
-- ==========================================

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'passenger',
  preferred_language language_code NOT NULL DEFAULT 'TH',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE users IS 'Stores user accounts for passengers, drivers, merchants, and admins.';

-- Wallets Table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  points_balance INT NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  total_earned INT NOT NULL DEFAULT 0,
  total_spent INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE wallets IS 'Stores user point balances and totals for the reward system.';

-- Routes Table
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  polyline GEOMETRY(LineString, 4326),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE routes IS 'Defines fixed routes for mobility services.';

-- Vehicles Table
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  plate_number VARCHAR(20) NOT NULL UNIQUE,
  route_id UUID REFERENCES routes(id),
  route_name VARCHAR(255),
  vehicle_type vehicle_type NOT NULL,
  max_seats INT NOT NULL CHECK (max_seats > 0),
  available_seats INT NOT NULL CHECK (available_seats >= 0),
  status vehicle_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE vehicles IS 'Stores vehicle information and current status.';

-- Vehicle Locations (Time-series)
CREATE TABLE vehicle_locations (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  location GEOMETRY(Point, 4326) NOT NULL,
  heading FLOAT CHECK (heading >= 0 AND heading < 360),
  speed FLOAT CHECK (speed >= 0),
  available_seats INT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE vehicle_locations IS 'Time-series data for vehicle telemetry and tracking.';

-- POI Places
CREATE TABLE poi_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_th VARCHAR(500) NOT NULL,
  name_ms VARCHAR(500),
  name_en VARCHAR(500),
  name_ar VARCHAR(500),
  description_th TEXT,
  description_ms TEXT,
  description_en TEXT,
  description_ar TEXT,
  category poi_category NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  address TEXT,
  halal_cert_id VARCHAR(100),
  halal_cert_expiry DATE,
  opening_hours JSONB,
  images JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE poi_places IS 'Points of Interest including mosques, halal restaurants, and tourism spots.';

-- Bus Stops
CREATE TABLE bus_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id),
  poi_id UUID REFERENCES poi_places(id),
  name_th VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_ms VARCHAR(255),
  name_ar VARCHAR(255),
  location GEOMETRY(Point, 4326) NOT NULL,
  sequence_order INT,
  is_active BOOLEAN NOT NULL DEFAULT true
);
COMMENT ON TABLE bus_stops IS 'Specific stops along routes, optionally linked to POIs.';

-- Quests
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  reward_points INT NOT NULL CHECK (reward_points > 0),
  required_pois JSONB NOT NULL DEFAULT '[]',
  badge_image_url TEXT,
  badge_name VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE quests IS 'Gamification quests for users to complete by visiting POIs.';

-- User Quest Progress
CREATE TABLE user_quest_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  completed_pois JSONB NOT NULL DEFAULT '[]',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, quest_id)
);
COMMENT ON TABLE user_quest_progress IS 'Tracks user progress on active quests.';

-- Checkins
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  poi_id UUID NOT NULL REFERENCES poi_places(id) ON DELETE RESTRICT,
  location_proof GEOMETRY(Point, 4326) NOT NULL,
  method checkin_method NOT NULL DEFAULT 'geofence',
  dwell_time_minutes INT DEFAULT 0,
  points_earned INT NOT NULL DEFAULT 0,
  qr_token_hash TEXT,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  fraud_flags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE checkins IS 'Records of users checking in at POIs.';

-- User Location Heartbeats
CREATE TABLE user_location_heartbeats (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location GEOMETRY(Point, 4326) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE user_location_heartbeats IS 'Anti-cheat tracking to verify dwell times at POIs.';

-- Rewards
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category reward_category NOT NULL,
  points_required INT NOT NULL CHECK (points_required > 0),
  stock_quantity INT NOT NULL DEFAULT -1,
  merchant_id UUID REFERENCES users(id),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE rewards IS 'Available items or benefits users can redeem with points.';

-- Redemptions
CREATE TABLE redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
  redemption_code VARCHAR(64) NOT NULL UNIQUE,
  status redemption_status NOT NULL DEFAULT 'pending',
  points_spent INT NOT NULL,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE redemptions IS 'Records of points spent on rewards.';

-- Payment Transactions
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency payment_currency NOT NULL DEFAULT 'THB',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50) NOT NULL,
  reference_id VARCHAR(255),
  ticket_qr_code TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE payment_transactions IS 'Financial transactions for platform services.';

-- Sadaqah Donations
CREATE TABLE sadaqah_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  points_converted INT NOT NULL,
  amount_thb NUMERIC(10,2) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_account VARCHAR(50),
  transaction_ref VARCHAR(100),
  receipt_pdf_url TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE sadaqah_donations IS 'Records of points converted to charitable donations.';

-- Wallet Transactions (Audit Log)
CREATE TABLE wallet_transactions (
  id BIGSERIAL PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  balance_before INT NOT NULL,
  balance_after INT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE wallet_transactions IS 'Immutable ledger of point additions and deductions.';

-- ==========================================
-- 4. INDEXES
-- ==========================================

-- GiST Spatial Indexes
CREATE INDEX idx_routes_polyline ON routes USING GIST(polyline);
CREATE INDEX idx_vehicle_locations_geom ON vehicle_locations USING GIST(location);
CREATE INDEX idx_poi_places_geom ON poi_places USING GIST(location);
CREATE INDEX idx_bus_stops_geom ON bus_stops USING GIST(location);
CREATE INDEX idx_checkins_geom ON checkins USING GIST(location_proof);
CREATE INDEX idx_user_heartbeats_geom ON user_location_heartbeats USING GIST(location);

-- B-tree Indexes for lookups and joins
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX idx_vehicle_locations_vehicle ON vehicle_locations(vehicle_id);
CREATE INDEX idx_poi_places_category ON poi_places(category);
CREATE INDEX idx_checkins_user_poi ON checkins(user_id, poi_id);
CREATE INDEX idx_wallet_tx_wallet ON wallet_transactions(wallet_id);

-- BRIN Index for time-series data
CREATE INDEX idx_vehicle_locations_time ON vehicle_locations USING BRIN(recorded_at);
CREATE INDEX idx_user_heartbeats_time ON user_location_heartbeats USING BRIN(recorded_at);

-- GIN Indexes for JSONB
CREATE INDEX idx_checkins_fraud_flags ON checkins USING GIN(fraud_flags);
CREATE INDEX idx_quests_required_pois ON quests USING GIN(required_pois);

-- Partial Indexes for active records
CREATE INDEX idx_active_users ON users(id) WHERE is_active = true;
CREATE INDEX idx_active_vehicles ON vehicles(id) WHERE status = 'active';
CREATE INDEX idx_active_pois ON poi_places(id) WHERE is_active = true;

-- ==========================================
-- 5. SPATIAL VIEWS
-- ==========================================

-- View: Active Vehicles with Latest Location
CREATE OR REPLACE VIEW v_active_vehicles_with_location AS
WITH latest_locs AS (
    SELECT DISTINCT ON (vehicle_id) 
        vehicle_id, location, heading, speed, recorded_at 
    FROM vehicle_locations 
    ORDER BY vehicle_id, recorded_at DESC
)
SELECT 
    v.id, v.plate_number, v.vehicle_type, v.max_seats, v.available_seats,
    v.route_name,
    l.location, l.heading, l.speed, l.recorded_at,
    ST_X(l.location::geometry) as lng, ST_Y(l.location::geometry) as lat
FROM vehicles v
JOIN latest_locs l ON v.id = l.vehicle_id
WHERE v.status = 'active';

-- View: POIs with Coordinates
CREATE OR REPLACE VIEW v_poi_with_coords AS
SELECT 
    id, name_th, category, address, is_active,
    location,
    ST_X(location::geometry) as lng, 
    ST_Y(location::geometry) as lat
FROM poi_places;

-- View: Nearby Mosques (Base view, usually queried with ST_DWithin)
CREATE OR REPLACE VIEW v_nearby_mosques AS
SELECT * FROM v_poi_with_coords WHERE category = 'mosque';

-- ==========================================
-- 6. FUNCTIONS & TRIGGERS
-- ==========================================

-- Trigger Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
CREATE TRIGGER trigger_update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_update_poi_places_updated_at BEFORE UPDATE ON poi_places FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_update_payment_tx_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function: Calculate distance in meters using ST_DistanceSphere
CREATE OR REPLACE FUNCTION calculate_distance_meters(
    lat1 FLOAT, lng1 FLOAT, 
    lat2 FLOAT, lng2 FLOAT
) RETURNS FLOAT AS $$
BEGIN
    RETURN ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(lng1, lat1), 4326),
        ST_SetSRID(ST_MakePoint(lng2, lat2), 4326)
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Award Points transactionally
CREATE OR REPLACE FUNCTION award_points(
    p_user_id UUID, 
    p_points INT, 
    p_reason TEXT, 
    p_ref_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_wallet_id UUID;
    v_balance_before INT;
    v_balance_after INT;
BEGIN
    IF p_points <= 0 THEN
        RETURN FALSE;
    END IF;

    -- Lock the wallet row for update
    SELECT id, points_balance INTO v_wallet_id, v_balance_before
    FROM wallets WHERE user_id = p_user_id FOR UPDATE;

    IF v_wallet_id IS NULL THEN
        RETURN FALSE;
    END IF;

    v_balance_after := v_balance_before + p_points;

    -- Update wallet
    UPDATE wallets 
    SET points_balance = v_balance_after, 
        total_earned = total_earned + p_points,
        updated_at = NOW()
    WHERE id = v_wallet_id;

    -- Insert audit log
    INSERT INTO wallet_transactions (
        wallet_id, user_id, amount, type, reference_id, reference_type, 
        balance_before, balance_after, description
    ) VALUES (
        v_wallet_id, p_user_id, p_points, 'EARN', p_ref_id, 'REWARD',
        v_balance_before, v_balance_after, p_reason
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 7. SEED DATA (Pattani Area)
-- ==========================================

-- Insert 3 Example POIs in Pattani
INSERT INTO poi_places (id, name_th, name_en, category, location, address) VALUES
(
    uuid_generate_v4(), 
    'มัสยิดกลางจังหวัดปัตตานี', 
    'Pattani Central Mosque', 
    'mosque', 
    ST_SetSRID(ST_MakePoint(101.2662, 6.8659), 4326), 
    'Yarang Rd, Pattani'
),
(
    uuid_generate_v4(), 
    'ร้านอาหารบังหลา', 
    'Bangla Halal Food', 
    'halal_restaurant', 
    ST_SetSRID(ST_MakePoint(101.2501, 6.8600), 4326), 
    'Charoenpradit Rd, Pattani'
),
(
    uuid_generate_v4(), 
    'ศาลเจ้าแม่ลิ้มกอเหนี่ยว', 
    'Leng Chu Kiang Shrine', 
    'tourism_spot', 
    ST_SetSRID(ST_MakePoint(101.2721, 6.8720), 4326), 
    'Ano-ru, Pattani'
);

-- Insert 1 Example Quest
INSERT INTO quests (title, description, reward_points, start_date, end_date) VALUES
(
    'Pattani Heritage Trail', 
    'Visit 3 historical places in Pattani to earn points.', 
    500, 
    NOW(), 
    NOW() + INTERVAL '30 days'
);

-- Insert 3 Example Rewards
INSERT INTO rewards (title, description, category, points_required, stock_quantity) VALUES
(
    'Free EV Shuttle Ride', 
    'Get one free ride on our EV Shuttle around Pattani city.', 
    'mobility', 
    200, 
    100
),
(
    '10% Discount at Bangla', 
    'Use this voucher to get 10% off your next meal at Bangla Halal Food.', 
    'gastronomy', 
    150, 
    50
),
(
    'Donate to Local Orphanage', 
    'Convert your points into a 50 THB Sadaqah donation.', 
    'sadaqah', 
    300, 
    -1
);
