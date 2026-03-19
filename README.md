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
