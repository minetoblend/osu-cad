import { MigrationInterface, QueryRunner } from 'typeorm';

export class S3AssetStorage1708722247345 implements MigrationInterface {
  name = 'S3AssetStorage1708722247345';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`s3_assets\` (\`key\` varchar(255) NOT NULL, \`refCount\` int NOT NULL DEFAULT '0', \`filesize\` int NOT NULL, \`bucket\` varchar(64) NOT NULL, PRIMARY KEY (\`key\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`assets\` (\`id\` varchar(36) NOT NULL, \`mapsetId\` varchar(36) NOT NULL, \`path\` varchar(512) NOT NULL, \`assetKey\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`assets\` ADD CONSTRAINT \`FK_c01f933a34e086ca57e5223bad1\` FOREIGN KEY (\`mapsetId\`) REFERENCES \`mapsets\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`assets\` ADD CONSTRAINT \`FK_313337fc1e56e7e75a63f003c9e\` FOREIGN KEY (\`assetKey\`) REFERENCES \`s3_assets\`(\`key\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`mapsets\` ADD \`s3Storage\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`assets\` DROP FOREIGN KEY \`FK_313337fc1e56e7e75a63f003c9e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`assets\` DROP FOREIGN KEY \`FK_c01f933a34e086ca57e5223bad1\``,
    );
    await queryRunner.query(`DROP TABLE \`assets\``);
    await queryRunner.query(`DROP TABLE \`s3_assets\``);
    await queryRunner.query(
      `ALTER TABLE \`mapsets\` DROP COLUMN \`s3Storage\``,
    );
  }
}
