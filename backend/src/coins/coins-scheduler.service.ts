import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CoinsService } from './coins.service';

@Injectable()
export class CoinsSchedulerService {
  constructor(private readonly coinsService: CoinsService) {}

  @Cron('*/15 * * * *') // Every 15 minutes
  async handleSync() {
    try {
      const result = await this.coinsService.sync();
      console.log(`[CoinsSync] Synced ${result.synced} coins at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('[CoinsSync] Error:', err);
    }
  }
}
