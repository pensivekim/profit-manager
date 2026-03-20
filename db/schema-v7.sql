-- 카카오 로그인 지원
ALTER TABLE users ADD COLUMN kakao_id TEXT;
ALTER TABLE users ADD COLUMN nickname TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_kakao_id
  ON users(kakao_id) WHERE kakao_id IS NOT NULL;
