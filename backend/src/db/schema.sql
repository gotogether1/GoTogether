-- Go Together — Complete Neon PostgreSQL Relational Database Schema

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(128) PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  city VARCHAR(255),
  bio TEXT,
  fcm_token TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  average_rating NUMERIC(3, 2) DEFAULT 5.00,
  completed_ride_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  device_type VARCHAR(50) DEFAULT 'android',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_fcm UNIQUE(user_id, fcm_token)
);

CREATE TABLE IF NOT EXISTS rides (
  id VARCHAR(128) PRIMARY KEY,
  driver_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('carpool', 'bike_pool')),
  pickup VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  pickup_address TEXT,
  pickup_latitude NUMERIC(10, 6) NOT NULL,
  pickup_longitude NUMERIC(10, 6) NOT NULL,
  pickup_place_id VARCHAR(255),
  dropoff_address TEXT,
  dropoff_latitude NUMERIC(10, 6) NOT NULL,
  dropoff_longitude NUMERIC(10, 6) NOT NULL,
  dropoff_place_id VARCHAR(255),
  meeting_point VARCHAR(255) NOT NULL,
  departure_at TIMESTAMP WITH TIME ZONE NOT NULL,
  total_seats INT NOT NULL CHECK (total_seats > 0),
  available_seats INT NOT NULL CHECK (available_seats >= 0),
  suggested_contribution NUMERIC(10, 2) DEFAULT 0.00,
  route_variant VARCHAR(100) DEFAULT 'fastest',
  route_polyline JSONB DEFAULT '[]'::jsonb,
  estimated_duration VARCHAR(50),
  estimated_distance VARCHAR(50),
  stopovers JSONB DEFAULT '[]'::jsonb,
  instant_booking BOOLEAN DEFAULT TRUE,
  allows_smoking BOOLEAN DEFAULT FALSE,
  allows_pets BOOLEAN DEFAULT FALSE,
  vehicle_details VARCHAR(255) NOT NULL,
  rules TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure location & polyline columns exist if table was created previously
ALTER TABLE rides ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS pickup_latitude NUMERIC(10, 6);
ALTER TABLE rides ADD COLUMN IF NOT EXISTS pickup_longitude NUMERIC(10, 6);
ALTER TABLE rides ADD COLUMN IF NOT EXISTS pickup_place_id VARCHAR(255);
ALTER TABLE rides ADD COLUMN IF NOT EXISTS dropoff_address TEXT;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS dropoff_latitude NUMERIC(10, 6);
ALTER TABLE rides ADD COLUMN IF NOT EXISTS dropoff_longitude NUMERIC(10, 6);
ALTER TABLE rides ADD COLUMN IF NOT EXISTS dropoff_place_id VARCHAR(255);
ALTER TABLE rides ADD COLUMN IF NOT EXISTS route_polyline JSONB DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(128) PRIMARY KEY,
  ride_id VARCHAR(128) NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  rider_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seats_requested INT NOT NULL CHECK (seats_requested > 0),
  negotiated_price NUMERIC(10, 2),
  rider_message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(128) PRIMARY KEY,
  booking_id VARCHAR(128) UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  driver_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rider_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  last_message_preview TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(128) PRIMARY KEY,
  conversation_id VARCHAR(128) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  booking_id VARCHAR(128) NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body VARCHAR(1000) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(128) PRIMARY KEY,
  booking_id VARCHAR(128) UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  author_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(128) PRIMARY KEY,
  reporter_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('user', 'ride', 'message')),
  target_id VARCHAR(128) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blocks (
  id VARCHAR(128) PRIMARY KEY,
  blocker_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_block_pair UNIQUE(blocker_id, blocked_id)
);
