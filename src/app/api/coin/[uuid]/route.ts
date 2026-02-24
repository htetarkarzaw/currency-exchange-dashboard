import { NextRequest, NextResponse } from 'next/server';

const COINRANKING_BASE = 'https://api.coinranking.com/v2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const apiKey = process.env.COINRANKING_API_KEY;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['x-access-token'] = apiKey;
  }

  try {
    const res = await fetch(`${COINRANKING_BASE}/coin/${uuid}`, { headers });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: (err as { message?: string }).message || `API error ${res.status}` },
        { status: res.status }
      );
    }

    const json = await res.json();

    if (json.status !== 'success' || !json.data?.coin) {
      return NextResponse.json(
        { message: 'Coin not found' },
        { status: 404 }
      );
    }

    const c = json.data.coin;
    const volume24h = (c as { '24hVolume'?: string })['24hVolume'];
    return NextResponse.json({
      id: c.uuid,
      uuid: c.uuid,
      symbol: c.symbol,
      name: c.name,
      description: c.description ?? null,
      color: c.color ?? null,
      iconUrl: c.iconUrl ?? null,
      websiteUrl: c.websiteUrl ?? null,
      price: c.price,
      btcPrice: c.btcPrice ?? null,
      priceAt: c.priceAt ?? null,
      change24h: c.change ?? '0',
      marketCap: c.marketCap ?? '0',
      volume24h: volume24h ?? null,
      fullyDilutedMarketCap: c.fullyDilutedMarketCap ?? null,
      rank: c.rank ?? 0,
      numberOfMarkets: c.numberOfMarkets ?? null,
      numberOfExchanges: c.numberOfExchanges ?? null,
      allTimeHigh: c.allTimeHigh ?? null,
      tags: c.tags ?? [],
      links: c.links ?? [],
      supply: c.supply ?? null,
      coinrankingUrl: c.coinrankingUrl ?? null,
      tier: c.tier ?? null,
      listedAt: c.listedAt ?? null,
      lowVolume: c.lowVolume ?? false,
      notices: c.notices ?? [],
      contractAddresses: c.contractAddresses ?? [],
      sparkline: c.sparkline ?? null,
      isWrappedTrustless: c.isWrappedTrustless ?? false,
      wrappedTo: c.wrappedTo ?? null,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[API] Coin detail error:', err);
    return NextResponse.json(
      { message: 'Failed to fetch coin' },
      { status: 500 }
    );
  }
}
