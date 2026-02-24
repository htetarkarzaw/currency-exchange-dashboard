import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CoinsModule } from './coins/coins.module';

const dbUrl = process.env.DATABASE_URL;
const useSqlite = !dbUrl || dbUrl.startsWith('sqlite');

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(
      useSqlite
        ? {
            type: 'better-sqlite3',
            database: 'data/currency_exchange.sqlite',
            autoLoadEntities: true,
            synchronize: true,
          }
        : {
            type: 'postgres',
            url: dbUrl,
            autoLoadEntities: true,
            synchronize: process.env.NODE_ENV !== 'production',
            migrations: ['dist/migrations/*.js'],
          },
    ),
    CoinsModule,
  ],
})
export class AppModule {}
