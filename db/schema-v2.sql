-- 사용자 (알림톡 발송 대상)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT NOT NULL,
  biz_type TEXT DEFAULT 'restaurant',
  tax_type TEXT DEFAULT 'general',
  emp_count INTEGER DEFAULT 0,
  work_days INTEGER DEFAULT 25,
  work_hours INTEGER DEFAULT 10,
  notify_enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 주간 기록
CREATE TABLE IF NOT EXISTS weekly_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  week_start TEXT NOT NULL,
  revenue INTEGER DEFAULT 0,
  cost_rent INTEGER DEFAULT 0,
  cost_labor INTEGER DEFAULT 0,
  cost_material INTEGER DEFAULT 0,
  cost_other INTEGER DEFAULT 0,
  final_profit INTEGER DEFAULT 0,
  hourly_wage INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 알림톡 발송 이력
CREATE TABLE IF NOT EXISTS alimtalk_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  template_code TEXT,
  status TEXT,
  error_msg TEXT,
  sent_at TEXT DEFAULT (datetime('now'))
);
