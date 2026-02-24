import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoinsTable1730000000000 implements MigrationInterface {
  name = 'CreateCoinsTable1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE "coins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "uuid" varchar NOT NULL,
        "symbol" varchar NOT NULL,
        "name" varchar NOT NULL,
        "price" decimal(24,8) NOT NULL DEFAULT 0,
        "change_24h" decimal(10,4),
        "market_cap" decimal(24,2) NOT NULL DEFAULT 0,
        "rank" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "fetched_at" TIMESTAMP NOT NULL,
        CONSTRAINT "UQ_coins_uuid" UNIQUE ("uuid"),
        CONSTRAINT "PK_coins_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_coins_uuid" ON "coins" ("uuid")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_coins_uuid"`);
    await queryRunner.query(`DROP TABLE "coins"`);
  }
}
