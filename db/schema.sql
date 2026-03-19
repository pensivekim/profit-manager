-- 사업자 정보
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  biz_name TEXT,
  biz_type TEXT NOT NULL,
  tax_type TEXT NOT NULL DEFAULT 'general',
  emp_count INTEGER DEFAULT 0,
  work_days INTEGER DEFAULT 25,
  work_hours INTEGER DEFAULT 10,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 월별 수입/지출 기록
CREATE TABLE IF NOT EXISTS monthly_records (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  year_month TEXT NOT NULL,
  revenue INTEGER DEFAULT 0,
  cost_rent INTEGER DEFAULT 0,
  cost_labor INTEGER DEFAULT 0,
  cost_material INTEGER DEFAULT 0,
  cost_other INTEGER DEFAULT 0,
  vat_provision INTEGER DEFAULT 0,
  income_tax_monthly INTEGER DEFAULT 0,
  insurance_cost INTEGER DEFAULT 0,
  final_profit INTEGER DEFAULT 0,
  hourly_wage INTEGER DEFAULT 0,
  memo TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- 전문가 상담 요청
CREATE TABLE IF NOT EXISTS consult_requests (
  id TEXT PRIMARY KEY,
  pro_type TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  message TEXT,
  record_snapshot TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);
