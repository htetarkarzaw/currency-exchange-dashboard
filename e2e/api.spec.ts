import { test, expect } from '@playwright/test';

test.describe('API routes', () => {
  test.describe('NestJS (via Next.js proxy)', () => {
    test('GET /api/coins returns array', async ({ request }) => {
      const res = await request.get('/api/coins');
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('GET /api/coins/sync returns synced count', async ({ request }) => {
      const res = await request.get('/api/coins/sync');
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data).toHaveProperty('synced');
      expect(typeof data.synced).toBe('number');
    });
  });

  test.describe('Next.js API (CoinRanking proxy)', () => {
    test('GET /api/coins-paginated returns coins and pagination', async ({ request }) => {
      test.setTimeout(15000);
      const res = await request.get('/api/coins-paginated?limit=5');
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data).toHaveProperty('coins');
      expect(Array.isArray(data.coins)).toBe(true);
      expect(data).toHaveProperty('pagination');
      if (data.coins.length > 0) {
        expect(data.coins[0]).toMatchObject({
          uuid: expect.any(String),
          symbol: expect.any(String),
          name: expect.any(String),
          price: expect.any(String),
          marketCap: expect.any(String),
          rank: expect.any(Number),
        });
      }
    });

    test('GET /api/coins-paginated accepts filter params', async ({ request }) => {
      const res = await request.get('/api/coins-paginated?limit=3&orderBy=marketCap&orderDirection=desc&timePeriod=24h');
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data).toHaveProperty('coins');
      expect(Array.isArray(data.coins)).toBe(true);
    });

    test('GET /api/coin/[uuid] returns coin details', async ({ request }) => {
      test.setTimeout(15000);
      const btcUuid = 'Qwsogvtv82FCd';
      const res = await request.get(`/api/coin/${btcUuid}`);
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data).toMatchObject({
        uuid: btcUuid,
        symbol: expect.stringMatching(/btc/i),
        name: expect.stringMatching(/bitcoin/i),
      });
    });

    test('GET /api/coin/[uuid]/history returns price history', async ({ request }) => {
      test.setTimeout(15000);
      const btcUuid = 'Qwsogvtv82FCd';
      const res = await request.get(`/api/coin/${btcUuid}/history?timePeriod=7d`);
      expect(res.ok()).toBeTruthy();
      const data = await res.json();
      expect(data).toHaveProperty('history');
      expect(Array.isArray(data.history)).toBe(true);
    });
  });
});
