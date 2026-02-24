import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinsService } from './coins.service';
import { Coin } from './coin.entity';
import { CoinRankingService } from './coin-ranking.service';

describe('CoinsService', () => {
  let service: CoinsService;
  let coinRepo: jest.Mocked<Repository<Coin>>;
  let coinRanking: jest.Mocked<CoinRankingService>;

  const mockCoin: Partial<Coin> = {
    id: 'test-id',
    uuid: 'Qwsogvtv82FCd',
    symbol: 'BTC',
    name: 'Bitcoin',
    iconUrl: 'https://example.com/btc.svg',
    price: '50000',
    change24h: '2.5',
    marketCap: '1000000000000',
    rank: 1,
    fetchedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      upsert: jest.fn(),
    };
    const mockCoinRanking = {
      fetchCoins: jest.fn(),
      fetchCoinHistory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinsService,
        { provide: getRepositoryToken(Coin), useValue: mockRepo },
        { provide: CoinRankingService, useValue: mockCoinRanking },
      ],
    }).compile();

    service = module.get<CoinsService>(CoinsService);
    coinRepo = module.get(getRepositoryToken(Coin)) as jest.Mocked<Repository<Coin>>;
    coinRanking = module.get(CoinRankingService) as jest.Mocked<CoinRankingService>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns coins ordered by rank', async () => {
      (coinRepo.find as jest.Mock).mockResolvedValue([mockCoin]);
      const result = await service.findAll();
      expect(coinRepo.find).toHaveBeenCalledWith({ order: { rank: 'ASC' } });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        uuid: 'Qwsogvtv82FCd',
        symbol: 'BTC',
        name: 'Bitcoin',
        price: '50000',
        rank: 1,
      });
    });

    it('returns empty array when no coins', async () => {
      (coinRepo.find as jest.Mock).mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('finds by id', async () => {
      (coinRepo.findOne as jest.Mock).mockResolvedValue(mockCoin);
      const result = await service.findOne('test-id');
      expect(result).toEqual(mockCoin);
    });

    it('finds by uuid when not found by id', async () => {
      (coinRepo.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCoin);
      const result = await service.findOne('Qwsogvtv82FCd');
      expect(result).toEqual(mockCoin);
    });

    it('returns null when not found', async () => {
      (coinRepo.findOne as jest.Mock).mockResolvedValue(null);
      const result = await service.findOne('unknown');
      expect(result).toBeNull();
    });
  });

  describe('getPriceHistory', () => {
    it('returns history when coin exists', async () => {
      (coinRepo.findOne as jest.Mock).mockResolvedValue(mockCoin);
      (coinRanking.fetchCoinHistory as jest.Mock).mockResolvedValue([
        { price: '50000', timestamp: 1234567890 },
      ]);
      const result = await service.getPriceHistory('Qwsogvtv82FCd', '7d');
      expect(coinRanking.fetchCoinHistory).toHaveBeenCalledWith('Qwsogvtv82FCd', '7d');
      expect(result).toEqual([{ price: '50000', timestamp: 1234567890 }]);
    });

    it('returns empty array when coin not found', async () => {
      (coinRepo.findOne as jest.Mock).mockResolvedValue(null);
      const result = await service.getPriceHistory('unknown', '7d');
      expect(coinRanking.fetchCoinHistory).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('sync', () => {
    it('upserts coins from CoinRanking and returns synced count', async () => {
      (coinRanking.fetchCoins as jest.Mock).mockResolvedValue([
        { uuid: 'a', symbol: 'BTC', name: 'Bitcoin', price: '50000', change: '1', marketCap: '1T', rank: 1 },
        { uuid: 'b', symbol: 'ETH', name: 'Ethereum', price: '3000', change: '2', marketCap: '300B', rank: 2 },
      ]);
      (coinRepo.upsert as jest.Mock).mockResolvedValue(undefined);

      const result = await service.sync();

      expect(coinRanking.fetchCoins).toHaveBeenCalled();
      expect(coinRepo.upsert).toHaveBeenCalledTimes(2);
      expect(coinRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          uuid: 'a',
          symbol: 'BTC',
          name: 'Bitcoin',
          price: '50000',
        }),
        ['uuid'],
      );
      expect(result).toEqual({ synced: 2 });
    });
  });
});
