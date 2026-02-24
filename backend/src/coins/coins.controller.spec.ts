import { Test, TestingModule } from '@nestjs/testing';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';

describe('CoinsController', () => {
  let controller: CoinsController;
  let service: jest.Mocked<CoinsService>;

  const mockCoin = {
    id: 'test-id',
    uuid: 'Qwsogvtv82FCd',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: '50000',
    change24h: '2.5',
    marketCap: '1000000000000',
    rank: 1,
  };

  beforeEach(async () => {
    const mockService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      getPriceHistory: jest.fn(),
      sync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoinsController],
      providers: [{ provide: CoinsService, useValue: mockService }],
    }).compile();

    controller = module.get<CoinsController>(CoinsController);
    service = module.get(CoinsService) as jest.Mocked<CoinsService>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('returns array of coins', async () => {
      (service.findAll as jest.Mock).mockResolvedValue([mockCoin]);
      const result = await controller.list();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCoin]);
    });
  });

  describe('sync', () => {
    it('returns synced count', async () => {
      (service.sync as jest.Mock).mockResolvedValue({ synced: 10 });
      const result = await controller.sync();
      expect(service.sync).toHaveBeenCalled();
      expect(result).toEqual({ synced: 10 });
    });
  });

  describe('getOne', () => {
    it('returns coin when found', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(mockCoin);
      const result = await controller.getOne('Qwsogvtv82FCd');
      expect(service.findOne).toHaveBeenCalledWith('Qwsogvtv82FCd');
      expect(result).toEqual(mockCoin);
    });

    it('returns 404 response when not found', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(null);
      const result = await controller.getOne('unknown');
      expect(result).toEqual({ statusCode: 404, message: 'Coin not found' });
    });
  });

  describe('getHistory', () => {
    it('returns history for coin', async () => {
      const history = [{ price: '50000', timestamp: 1234567890 }];
      (service.getPriceHistory as jest.Mock).mockResolvedValue(history);
      const result = await controller.getHistory('Qwsogvtv82FCd', '7d');
      expect(service.getPriceHistory).toHaveBeenCalledWith('Qwsogvtv82FCd', '7d');
      expect(result).toEqual({ history });
    });

    it('uses default timePeriod when not provided', async () => {
      (service.getPriceHistory as jest.Mock).mockResolvedValue([]);
      await controller.getHistory('Qwsogvtv82FCd');
      expect(service.getPriceHistory).toHaveBeenCalledWith('Qwsogvtv82FCd', '7d');
    });
  });
});
