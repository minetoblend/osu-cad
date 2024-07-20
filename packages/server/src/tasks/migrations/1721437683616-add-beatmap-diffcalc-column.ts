/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBeatmapDiffcalcColumn1721437683616 implements MigrationInterface {
    name = 'AddBeatmapDiffcalcColumn1721437683616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`needsDiffCalc\` tinyint NOT NULL DEFAULT 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`needsDiffCalc\``);
    }

}
