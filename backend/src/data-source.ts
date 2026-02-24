import { DataSource } from 'typeorm';

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/currency_exchange';

export default new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
