/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class BeatmapThumbnails1708971421003 implements MigrationInterface {
    name = 'BeatmapThumbnails1708971421003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`needsThumbnail\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`thumbnailLargeKey\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`thumbnailSmallKey\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD CONSTRAINT \`FK_c2d690ed8bb821eef78305cb6a8\` FOREIGN KEY (\`thumbnailLargeKey\`) REFERENCES \`s3_assets\`(\`key\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD CONSTRAINT \`FK_403f2ecc3b432b6b36ed9666267\` FOREIGN KEY (\`thumbnailSmallKey\`) REFERENCES \`s3_assets\`(\`key\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP FOREIGN KEY \`FK_403f2ecc3b432b6b36ed9666267\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP FOREIGN KEY \`FK_c2d690ed8bb821eef78305cb6a8\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`thumbnailSmallKey\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`thumbnailLargeKey\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`needsThumbnail\``);
    }

}
