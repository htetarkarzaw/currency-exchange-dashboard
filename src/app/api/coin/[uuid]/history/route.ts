import { NextRequest, NextResponse } from 'next/server';

const COINRANKING_BASE = 'https://api.coinranking.com/v2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const { searchParams } = new URL(request.url);
  const timePeriod = searchParams.get('timePeriod') || '7d';

  const apiKey = process.env.COINRANKING_API_KEY;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['x-access-token'] = apiKey;
  }

  try {
    const res = await fetch(
      `${COINRANKING_BASE}/coin/${uuid}/price-history?timePeriod=${timePeriod}`,
      { headers }
    );

    if (!res.ok) {
      return NextResponse.json({ history: [] }, { status: 200 });
    }

    const json = await res.json();

    if (json.status !== 'success' || !json.data?.history) {
      return NextResponse.json({ history: [] });
    }

    const history = json.data.history.map(
      (h: { price: string; timestamp: number }) => ({
        price: h.price,
        timestamp: h.timestamp,
      })
    );

    return NextResponse.json({ history });
  } catch (err) {
    console.error('[API] Coin history error:', err);
    return NextResponse.json({ history: [] });
  }
}
