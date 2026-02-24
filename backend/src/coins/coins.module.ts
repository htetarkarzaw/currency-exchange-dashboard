import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coin } from './coin.entity';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';
import { CoinRankingService } from './coin-ranking.service';
import { CoinsSchedulerService } from './coins-scheduler.service';

@Module({
  imports: [TypeOrmModule.forFeature([Coin])],
  controllers: [CoinsController],
  providers: [CoinsService, CoinRankingService, CoinsSchedulerService],
})
export class CoinsModule {}
