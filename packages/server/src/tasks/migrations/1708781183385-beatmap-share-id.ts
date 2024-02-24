/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class BeatmapShareId1708781183385 implements MigrationInterface {
    name = 'BeatmapShareId1708781183385'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`shareId\` char(12) NOT NULL DEFAULT ''`);
        await queryRunner.query(`UPDATE \`beatmaps\` SET \`shareId\` = LEFT(MD5(RAND()), 12)`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD UNIQUE INDEX \`IDX_09f05e9317a5f3d39207978d4d\` (\`shareId\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`shareId\` ON \`beatmaps\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`shareId\``);
    }

}
