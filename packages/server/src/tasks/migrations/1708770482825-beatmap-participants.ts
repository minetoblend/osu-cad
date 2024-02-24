/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class BeatmapParticipants1708770482825 implements MigrationInterface {
    name = 'BeatmapParticipants1708770482825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE \`participant\``);
        await queryRunner.query(`ALTER TABLE \`participant\` DROP FOREIGN KEY \`FK_75f20e120c3ae061f0ecfcd2a3d\``);
        await queryRunner.query(`ALTER TABLE \`participant\` DROP COLUMN \`mapsetId\``);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD \`beatmapId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`access\` int NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_211000a6b8833d2997d3eafc8d\` ON \`beatmap_snapshot\` (\`createDate\`)`);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD CONSTRAINT \`FK_b054509707208f3971234785139\` FOREIGN KEY (\`beatmapId\`) REFERENCES \`beatmaps\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`participant\` DROP FOREIGN KEY \`FK_b054509707208f3971234785139\``);
        await queryRunner.query(`DROP INDEX \`IDX_211000a6b8833d2997d3eafc8d\` ON \`beatmap_snapshot\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`access\``);
        await queryRunner.query(`ALTER TABLE \`participant\` DROP COLUMN \`beatmapId\``);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD \`mapsetId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD CONSTRAINT \`FK_75f20e120c3ae061f0ecfcd2a3d\` FOREIGN KEY (\`mapsetId\`) REFERENCES \`mapsets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
