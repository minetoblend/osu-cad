import { MigrationInterface, QueryRunner } from 'typeorm';

export class BeatmapSnapshots1708736838564 implements MigrationInterface {
  name = 'BeatmapSnapshots1708736838564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`beatmap_snapshot\` (\`id\` varchar(36) NOT NULL, \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`version\` int NOT NULL, \`data\` json NOT NULL, \`beatmapId\` int NULL, INDEX \`IDX_9f335b3173d84e6675558aeb51\` (\`timestamp\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`beatmap_snapshot\` ADD CONSTRAINT \`FK_653dc96bbbb6d8aa57a6a0e7940\` FOREIGN KEY (\`beatmapId\`) REFERENCES \`beatmaps\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `
            INSERT INTO \`beatmap_snapshot\` (\`id\`, \`version\`, \`data\`, \`beatmapId\`)
                SELECT
                    UUID(),
                    IFNULL(JSON_EXTRACT(\`data\`, "$.version"), 1),
                    \`data\`,
                    \`id\`
            FROM \`beatmaps\`
            `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`beatmap_snapshot\` DROP FOREIGN KEY \`FK_653dc96bbbb6d8aa57a6a0e7940\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_9f335b3173d84e6675558aeb51\` ON \`beatmap_snapshot\``,
    );
    await queryRunner.query(`DROP TABLE \`beatmap_snapshot\``);
  }
}
