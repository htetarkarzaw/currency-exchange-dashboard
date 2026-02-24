import { NextRequest, NextResponse } from 'next/server';

const COINRANKING_BASE = 'https://api.coinranking.com/v2';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '10';
  const offset = searchParams.get('offset') || '0';
  const cursor = searchParams.get('cursor');
  const symbols = searchParams.get('symbols');
  const tiers = searchParams.get('tiers');
  const tags = searchParams.get('tags');
  const orderBy = searchParams.get('orderBy');
  const orderDirection = searchParams.get('orderDirection');
  const timePeriod = searchParams.get('timePeriod');

  const apiKey = process.env.COINRANKING_API_KEY;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['x-access-token'] = apiKey;
  }

  try {
    let url = `${COINRANKING_BASE}/coins?limit=${limit}`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    } else {
      url += `&offset=${offset}`;
    }
    if (symbols) {
      symbols.split(',').forEach((s) => {
        const t = s.trim();
        if (t) url += `&symbols[]=${encodeURIComponent(t)}`;
      });
    }
    if (tiers) {
      tiers.split(',').forEach((t) => {
        const v = t.trim();
        if (['1', '2', '3'].includes(v)) url += `&tiers[]=${v}`;
      });
    }
    if (tags) {
      tags.split(',').forEach((t) => {
        const v = t.trim();
        if (v) url += `&tags[]=${encodeURIComponent(v)}`;
      });
    }
    if (orderBy && ['price', 'marketCap', '24hVolume', 'change', 'listedAt'].includes(orderBy)) {
      url += `&orderBy=${orderBy}`;
    }
    if (orderDirection && ['asc', 'desc'].includes(orderDirection)) {
      url += `&orderDirection=${orderDirection}`;
    }
    if (timePeriod && ['1h', '3h', '12h', '24h', '7d', '30d', '3m', '1y', '3y', '5y'].includes(timePeriod)) {
      url += `&timePeriod=${timePeriod}`;
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: (err as { message?: string }).message || `API error ${res.status}` },
        { status: res.status }
      );
    }

    const json = await res.json();

    if (json.status !== 'success' || !json.data?.coins) {
      return NextResponse.json(
        { message: 'Failed to fetch coins', coins: [], pagination: null },
        { status: 200 }
      );
    }

    const coins = json.data.coins.map((c: { uuid: string; symbol: string; name: string; iconUrl?: string; price: string; change: string; marketCap: string; rank: number }) => ({
      id: c.uuid,
      uuid: c.uuid,
      symbol: c.symbol,
      name: c.name,
      iconUrl: c.iconUrl ?? null,
      price: c.price,
      change24h: c.change ?? '0',
      marketCap: c.marketCap ?? '0',
      rank: c.rank ?? 0,
      fetchedAt: new Date().toISOString(),
    }));

    const pagination = json.pagination
      ? {
          limit: json.pagination.limit,
          hasNextPage: json.pagination.hasNextPage ?? false,
          hasPreviousPage: json.pagination.hasPreviousPage ?? false,
          nextCursor: json.pagination.nextCursor ?? null,
          previousCursor: json.pagination.previousCursor ?? null,
          total: json.data?.stats?.total ?? null,
        }
      : null;

    return NextResponse.json({
      coins,
      pagination,
    });
  } catch (err) {
    console.error('[API] Coins paginated error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch coins', coins: [], pagination: null },
      { status: 500 }
    );
  }
}
