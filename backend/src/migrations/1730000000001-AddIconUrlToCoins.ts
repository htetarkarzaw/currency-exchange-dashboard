import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIconUrlToCoins1730000000001 implements MigrationInterface {
  name = 'AddIconUrlToCoins1730000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'coins' AND column_name = 'icon_url'
    `);
    if (!hasColumn || (Array.isArray(hasColumn) && hasColumn.length === 0)) {
      await queryRunner.query(`ALTER TABLE "coins" ADD "icon_url" varchar`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "coins" DROP COLUMN IF EXISTS "icon_url"`);
  }
}
