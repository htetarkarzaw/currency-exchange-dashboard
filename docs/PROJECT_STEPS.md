# Currency Exchange Dashboard - Project Steps

## Build Flow

1. **PO subagent** — User stories for sync, dashboard, coin display
2. **Tech-leader subagent** — TDD (sync job, API, DB schema)
3. **Developer subagent** — Implement sync + API + dashboard
4. **Tester subagent** — Playwright tests
5. **Security-auditor subagent** — Review (API keys, rate limits)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
cd backend && npm install && cd ..
```

### 2. Environment

```bash
cp .env.example .env
# Edit .env and set COINRANKING_API_KEY (get from https://account.coinranking.com/dashboard)
```

### 3. Database

```bash
# Start PostgreSQL
npm run db:up

# Run migrations
cd backend && npm run migration:run && cd ..
```

### 4. Development

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Dashboard  │────▶│  NestJS API  │────▶│   PostgreSQL    │
│  (Next.js)  │     │  (port 3001) │     │   (coins table) │
└─────────────┘     └──────┬──────┘     └─────────────────┘
                           │
                           │ every 5 min
                           ▼
                  ┌─────────────────┐
                  │ CoinRanking API │
                  └─────────────────┘
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/coins | List all coins from DB |
| GET | /api/coins/:id | Get coin by UUID |
| GET | /api/coins/sync | Manual sync from CoinRanking |
