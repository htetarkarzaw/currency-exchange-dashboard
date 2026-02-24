import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coin } from './coin.entity';
import { CoinRankingService } from './coin-ranking.service';

@Injectable()
export class CoinsService {
  constructor(
    @InjectRepository(Coin)
    private readonly coinRepo: Repository<Coin>,
    private readonly coinRanking: CoinRankingService,
  ) {}

  async findAll(): Promise<Partial<Coin>[]> {
    const coins = await this.coinRepo.find({
      order: { rank: 'ASC' },
    });
    return coins.map((c) => ({
      id: c.id,
      uuid: c.uuid,
      symbol: c.symbol,
      name: c.name,
      iconUrl: c.iconUrl,
      price: c.price,
      change24h: c.change24h,
      marketCap: c.marketCap,
      rank: c.rank,
      fetchedAt: c.fetchedAt,
    }));
  }

  async findOne(idOrUuid: string): Promise<Coin | null> {
    const byId = await this.coinRepo.findOne({ where: { id: idOrUuid } });
    if (byId) return byId;
    return this.coinRepo.findOne({ where: { uuid: idOrUuid } });
  }

  async getPriceHistory(
    coinIdOrUuid: string,
    timePeriod: string = '7d',
  ): Promise<{ price: string; timestamp: number }[]> {
    const coin = await this.coinRepo.findOne({
      where: [{ id: coinIdOrUuid }, { uuid: coinIdOrUuid }],
    });
    if (!coin) return [];
    return this.coinRanking.fetchCoinHistory(coin.uuid, timePeriod);
  }

  async sync(): Promise<{ synced: number }> {
    const coins = await this.coinRanking.fetchCoins();
    const now = new Date();

    let synced = 0;
    for (const c of coins) {
      await this.coinRepo.upsert(
        {
          uuid: c.uuid,
          symbol: c.symbol,
          name: c.name,
          iconUrl: c.iconUrl ?? null,
          price: c.price,
          change24h: c.change ?? null,
          marketCap: c.marketCap ?? '0',
          rank: c.rank ?? 0,
          fetchedAt: now,
        },
        ['uuid'],
      );
      synced++;
    }

    return { synced };
  }
}
