-- SIH Disaster-Response Drone Event Database Schema
-- Person 2 Ground Station & Backend

CREATE TABLE IF NOT EXISTS events (
    event_id TEXT PRIMARY KEY,
    hazard TEXT NOT NULL,
    hazard_code INTEGER NOT NULL,
    confidence REAL NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('HIGH', 'MEDIUM', 'LOW')),
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    altitude REAL NOT NULL DEFAULT 0.0,
    timestamp TEXT NOT NULL,
    image_path TEXT,
    channel TEXT NOT NULL DEFAULT 'WIFI' CHECK(channel IN ('WIFI', 'LORA')),
    status TEXT NOT NULL DEFAULT 'UNRESOLVED' CHECK(status IN ('UNRESOLVED', 'ACKNOWLEDGED', 'RESOLVED')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying by hazard, priority, date, and status
CREATE INDEX IF NOT EXISTS idx_events_hazard ON events(hazard);
CREATE INDEX IF NOT EXISTS idx_events_priority ON events(priority);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_channel ON events(channel);
