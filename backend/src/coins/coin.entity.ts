import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('coins')
export class Coin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index({ unique: true })
  uuid: string;

  @Column()
  symbol: string;

  @Column()
  name: string;

  @Column({ name: 'icon_url', type: 'varchar', nullable: true })
  iconUrl: string | null;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: 0 })
  price: string;

  @Column({ name: 'change_24h', type: 'decimal', precision: 10, scale: 4, nullable: true })
  change24h: string | null;

  @Column({ name: 'market_cap', type: 'decimal', precision: 24, scale: 2, default: 0 })
  marketCap: string;

  @Column({ type: 'int', default: 0 })
  rank: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'fetched_at' })
  fetchedAt: Date;
}
