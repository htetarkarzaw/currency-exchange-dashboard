import { Injectable } from '@nestjs/common';

const COINRANKING_BASE = 'https://api.coinranking.com/v2';

interface CoinRankingCoin {
  uuid: string;
  symbol: string;
  name: string;
  iconUrl?: string;
  price: string;
  change: string;
  marketCap: string;
  rank: number;
}

interface CoinRankingResponse {
  status: string;
  data?: {
    coins: CoinRankingCoin[];
  };
  message?: string;
}

@Injectable()
export class CoinRankingService {
  async fetchCoins(limit = 100): Promise<CoinRankingCoin[]> {
    const apiKey = process.env.COINRANKING_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['x-access-token'] = apiKey;
    }

    const url = `${COINRANKING_BASE}/coins?limit=${limit}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`CoinRanking API error: ${res.status} ${res.statusText}`);
    }

    const json: CoinRankingResponse = await res.json();

    if (json.status !== 'success' || !json.data?.coins) {
      throw new Error(json.message || 'Failed to fetch coins from CoinRanking');
    }

    return json.data.coins;
  }

  async fetchCoinHistory(
    uuid: string,
    timePeriod: string = '7d',
  ): Promise<{ price: string; timestamp: number }[]> {
    const apiKey = process.env.COINRANKING_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['x-access-token'] = apiKey;
    }

    const url = `${COINRANKING_BASE}/coin/${uuid}/price-history?timePeriod=${timePeriod}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`CoinRanking API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    if (json.status !== 'success' || !json.data?.history) {
      return [];
    }

    return json.data.history.map((h: { price: string; timestamp: number }) => ({
      price: h.price,
      timestamp: h.timestamp,
    }));
  }
}
