# Profit Manager - 소상공인 경영관리 SaaS

매출에서 세금, 보험, 원가를 빼고 **진짜 내 손에 남는 돈**을 계산합니다.

**도메인**: https://pro.genomic.cc

## Features

- 9개 업종 벤치마크 기반 원가 자동 계산 (식당/미용실/배달/방문판매/프리랜서/특수고용 등)
- 부가세, 종합소득세, 4대보험 자동 산출
- 시간당 수익 계산 (최저시급 비교)
- AI 경영 조언 (Gemini via Cloudflare AI Gateway)
- 전문가 연결 (세무사/노무사/변호사) + 상담 신청
- 주별/월별 추이 차트 + 위험 경보
- PWA (홈화면 추가, 오프라인 캐시)
- 주간 매출 10초 입력 (/weekly)

## Tech Stack

- **Frontend**: Next.js 15 + Tailwind CSS v4 + Chart.js
- **Infra**: Cloudflare Pages + Workers (Cron) + D1
- **AI**: Gemini 2.5 Flash Lite (Cloudflare AI Gateway "carebot")
- **Notification**: NHN Cloud Kakao Alimtalk (현재 비활성화)

## Pages

| Path | Description |
|------|-------------|
| `/` | Landing page (daily quote, tips, service intro) |
| `/calc` | Full calculator with result analysis |
| `/weekly` | Quick weekly revenue input (10 seconds) |
| `/settings` | User profile setup (one-time) |
| `/history` | Weekly/monthly trend charts |

## Local Development

```bash
npm install
npm run build
npx wrangler pages dev .next --d1=DB
```

Open http://localhost:8788

## Environment Variables (Secrets)

### Pages Secrets
Register via `npx wrangler pages secret put <KEY> --project-name profit-manager`:

| Key | Description |
|-----|-------------|
| `GEMINI_API_KEY` | Google AI Studio API key (for AI advice) |
| `NHN_APPKEY` | NHN Cloud app key |
| `NHN_SECRET_KEY` | NHN Cloud secret key |
| `NHN_SENDER_KEY` | Kakao sender profile key |
| `ADMIN_PHONE` | Admin phone for consult notifications |

### Worker Secrets (profit-cron)
Register via `cd worker && npx wrangler secret put <KEY>`:

Same NHN keys + `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (for push notifications)

### Client-side Env
| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | VAPID public key for push subscription |

## Deploy

GitHub push to `main` triggers Cloudflare Pages auto-build.

```bash
# Manual deploy (if needed)
npm run build
# Pages auto-deploys via GitHub

# Cron Worker deploy
cd worker && npx wrangler deploy
```

## Database

D1 database `profit-manager-db` (ID: `cf3bc1f7-022f-4a06-ba70-775344d31e85`)

| Table | Schema | Description |
|-------|--------|-------------|
| `businesses` | schema.sql | Business profiles |
| `monthly_records` | schema.sql | Monthly revenue/cost records |
| `consult_requests` | schema.sql | Expert consultation requests |
| `users` | schema-v2.sql | User profiles (phone, biz settings) |
| `weekly_records` | schema-v2.sql | Weekly revenue records + AI comment |
| `alimtalk_logs` | schema-v2.sql | Notification send logs |
| `push_subscriptions` | schema-v4.sql | Push notification subscriptions |

## 알림톡 활성화 방법 (사용자 500명 이상 권장)

현재 알림톡/SMS 발송과 Cron은 비활성화 상태입니다. 활성화하려면:

1. `src/lib/alimtalk.ts` 에서 `ALIMTALK_ENABLED = true` 로 변경
2. `worker/wrangler.toml` 에서 `[triggers]` crons 주석 해제
3. NHN Cloud 콘솔에서 알림톡 템플릿 2개 등록 (심사 1~2일 소요)
   - `WEEKLY_REMIND` : 월요일 리마인더
   - `WEEKLY_REPORT` : 금요일 성적표
4. 시크릿 등록 확인
5. Cron Worker 재배포: `cd worker && npx wrangler deploy`

## Push 알림 활성화

```bash
npx web-push generate-vapid-keys
# 출력된 키로 등록:
npx wrangler pages secret put NEXT_PUBLIC_VAPID_PUBLIC_KEY --project-name profit-manager
cd worker && npx wrangler secret put VAPID_PUBLIC_KEY
cd worker && npx wrangler secret put VAPID_PRIVATE_KEY
```
