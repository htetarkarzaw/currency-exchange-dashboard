# Currency Exchange Dashboard

A cryptocurrency dashboard powered by the [CoinRanking API](https://coinranking.com/api/documentation). Track prices, market caps, and 24h changes with search, filters, and offline support.

## Features

- **List view** – Paginated coin table with rank, symbol, name, price, change %, market cap
- **Search** – Filter by symbol or name (client-side from DB)
- **Filters** – Tiers (1–3), tags (defi, stablecoin, nft, etc.), order by, time period
- **Detail page** – Full coin info, price chart, supply, links, tags
- **Offline** – localStorage cache when API is unavailable
- **Sync** – Cron every 15 min + manual refresh

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide icons
- **Backend:** NestJS, TypeORM
- **Database:** PostgreSQL (Docker) or SQLite (dev fallback)
- **Tests:** Jest (backend), Playwright (E2E + API)

## Quick Start

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..

# 2. Copy env and set your CoinRanking API key
cp .env.example .env

# 3. Start PostgreSQL (optional – falls back to SQLite)
npm run db:up

# 4. Run migrations
npm run db:migrate

# 5. Start dev servers
npm run dev
```

- **Frontend:** http://localhost:3000 (landing) / http://localhost:3000/dashboard
- **Backend:** http://localhost:8000 (via `BACKEND_PORT`)

For PostgreSQL, set `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/currency_exchange` (port 5433 from Docker).

## API Endpoints

| Route | Source | Description |
|-------|--------|-------------|
| `GET /api/coins` | NestJS | List all coins from DB |
| `GET /api/coins/sync` | NestJS | Trigger sync from CoinRanking |
| `GET /api/coins/:id` | NestJS | Get coin by ID from DB |
| `GET /api/coins/:id/history` | NestJS | Price history from CoinRanking |
| `GET /api/coins-paginated` | Next.js | Paginated list from CoinRanking (filters: tiers, tags, orderBy, timePeriod) |
| `GET /api/coin/[uuid]` | Next.js | Coin details from CoinRanking |
| `GET /api/coin/[uuid]/history` | Next.js | Price history from CoinRanking |

## Data Flow

- **List & detail** – Next.js API routes proxy directly to CoinRanking
- **Search** – Next.js rewrites to NestJS → DB (synced coins)
- **Sync** – NestJS cron (15 min) + manual `/api/coins/sync` → CoinRanking → DB

## Testing

```bash
# Install Playwright browsers (first time only)
npm run test:install

# Run all tests (backend unit + E2E)
npm test

# Run only backend unit tests
npm run test:unit

# Run only Playwright E2E tests (starts dev server if needed)
npm run test:e2e

# Run E2E with UI
npm run test:e2e:ui
```

- **Backend (Jest):** `CoinsService`, `CoinsController`
- **E2E (Playwright):** Landing, Dashboard (list, search, filters), Coin detail, API routes
