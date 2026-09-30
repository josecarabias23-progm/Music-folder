import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupIdToRehearsalLogs1789700000000 implements MigrationInterface {
  name = 'AddGroupIdToRehearsalLogs1789700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE rehearsal_logs ADD COLUMN IF NOT EXISTS group_id VARCHAR NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE rehearsal_logs DROP COLUMN IF EXISTS group_id;
    `);
  }
}
