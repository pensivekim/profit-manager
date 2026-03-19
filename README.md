# Profit Manager - 소상공인 경영관리 SaaS

매출에서 세금, 보험, 원가를 빼고 **진짜 내 손에 남는 돈**을 계산합니다.

## Features

- 업종별 벤치마크 기반 원가 자동 계산 (미용실/식당/소매/제조/서비스)
- 부가세, 종합소득세, 4대보험 자동 산출
- 시간당 수익 계산 (최저시급 비교)
- AI 경영 조언 (Claude API via Cloudflare AI Gateway)
- 전문가 연결 (세무사/노무사/변호사) + 카카오 알림톡
- 월별 추이 차트 + 위험 경보

## Tech Stack

- **Frontend**: Next.js 15 + Tailwind CSS + Chart.js
- **Infra**: Cloudflare Pages + Workers + D1
- **AI**: Claude API (Cloudflare AI Gateway "carebot")
- **Notification**: NHN Cloud Kakao Alimtalk

## Local Development

```bash
npm install
npm run build
npx wrangler pages dev .next --d1=DB
```

Open http://localhost:8788

## Environment Variables (Secrets)

Register via `npx wrangler secret put <KEY>`:

| Key | Description |
|-----|-------------|
| `ANTHROPIC_API_KEY` | Claude API key for AI advice |
| `CF_ACCOUNT_ID` | Cloudflare account ID (for AI Gateway) |
| `NHN_APPKEY` | NHN Cloud app key |
| `NHN_SECRET_KEY` | NHN Cloud secret key |
| `NHN_SENDER_KEY` | Kakao sender profile key |
| `ADMIN_PHONE` | Admin phone for consult notifications |

## Deploy

```bash
# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .next --project-name=profit-manager

# Custom domain
# Cloudflare Dashboard > Pages > profit-manager > Custom domains > profit.genomic.cc
```

## Database

D1 database `profit-manager-db` with tables:
- `businesses` - Business profiles
- `monthly_records` - Monthly revenue/cost records
- `consult_requests` - Expert consultation requests

Schema: `db/schema.sql`

## 알림톡 활성화 방법 (사용자 500명 이상 권장)

현재 알림톡/SMS 발송과 Cron은 비활성화 상태입니다. 활성화하려면:

1. `src/lib/alimtalk.ts` 에서 `ALIMTALK_ENABLED = true` 로 변경
2. `worker/wrangler.toml` 에서 `[triggers]` crons 주석 해제
3. NHN Cloud 콘솔에서 알림톡 템플릿 2개 등록 (심사 1~2일 소요)
   - `WEEKLY_REMIND` : 월요일 리마인더
   - `WEEKLY_REPORT` : 금요일 성적표
4. 시크릿 등록 확인:
   ```bash
   npx wrangler pages secret put NHN_APPKEY --project-name profit-manager
   npx wrangler pages secret put NHN_SECRET_KEY --project-name profit-manager
   npx wrangler pages secret put NHN_SENDER_KEY --project-name profit-manager
   npx wrangler pages secret put ADMIN_PHONE --project-name profit-manager
   ```
5. Cron Worker 재배포: `cd worker && npx wrangler deploy`
