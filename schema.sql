-- D1 Database Schema for Open KJ (Karaoke Song Request System)
-- Run this to initialize your database

-- Songs library table
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  duration INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Song requests queue
CREATE TABLE IF NOT EXISTS song_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id TEXT,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  singer TEXT NOT NULL DEFAULT 'Anonymous',
  key_change INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User favourites
CREATE TABLE IF NOT EXISTS favourites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  song_id TEXT,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT 'default',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Legacy generic data table (for backwards compatibility)
CREATE TABLE IF NOT EXISTS open_kj_data (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'unknown',
  payload TEXT NOT NULL DEFAULT '{}',
  timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source TEXT NOT NULL DEFAULT 'cloudflare-d1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API logs
CREATE TABLE IF NOT EXISTS api_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_body TEXT,
  response_status INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_songs_search ON songs(title, artist);
CREATE INDEX IF NOT EXISTS idx_requests_status ON song_requests(status, requested_at);
CREATE INDEX IF NOT EXISTS idx_favourites_user ON favourites(user_id);