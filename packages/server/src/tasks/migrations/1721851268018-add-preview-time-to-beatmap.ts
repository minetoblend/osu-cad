import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPreviewTimeToBeatmap1721851268018 implements MigrationInterface {
    name = 'AddPreviewTimeToBeatmap1721851268018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`previewTime\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`previewTime\``);
    }

}
