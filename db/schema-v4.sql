CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT,
  auth TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
