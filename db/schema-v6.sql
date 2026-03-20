-- 지역별 벤치마크 지원
ALTER TABLE users ADD COLUMN region TEXT DEFAULT 'daegu';
ALTER TABLE businesses ADD COLUMN region TEXT DEFAULT 'daegu';
