import { Controller, Get, Param, Query } from '@nestjs/common';
import { CoinsService } from './coins.service';

@Controller('api/coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  @Get()
  async list() {
    return this.coinsService.findAll();
  }

  @Get('sync')
  async sync() {
    return this.coinsService.sync();
  }

  @Get(':id/history')
  async getHistory(
    @Param('id') id: string,
    @Query('timePeriod') timePeriod?: string,
  ) {
    const history = await this.coinsService.getPriceHistory(
      id,
      timePeriod || '7d',
    );
    return { history };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const coin = await this.coinsService.findOne(id);
    if (!coin) {
      return { statusCode: 404, message: 'Coin not found' };
    }
    return coin;
  }
}
