-- 인증 코드
CREATE TABLE IF NOT EXISTS auth_codes (
  phone TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

-- users 테이블에 plan, premium_until 컬럼 추가
-- SQLite는 ALTER TABLE ADD COLUMN IF NOT EXISTS 미지원이므로 에러 무시
ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN premium_until TEXT;
