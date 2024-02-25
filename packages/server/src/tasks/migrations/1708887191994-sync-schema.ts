/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1708887191994 implements MigrationInterface {
    name = 'SyncSchema1708887191994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        //await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`data\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP FOREIGN KEY \`FK_3b9bb91032dc978aefd964d238d\``);
        await queryRunner.query(`ALTER TABLE \`assets\` DROP FOREIGN KEY \`FK_c01f933a34e086ca57e5223bad1\``);
        await queryRunner.query(`ALTER TABLE \`mapsets\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`mapsets\` CHANGE \`id\` \`id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` CHANGE \`access\` \`access\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`participant\` DROP FOREIGN KEY \`FK_b054509707208f3971234785139\``);
        await queryRunner.query(`ALTER TABLE \`participant\` CHANGE \`beatmapId\` \`beatmapId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD CONSTRAINT \`FK_3b9bb91032dc978aefd964d238d\` FOREIGN KEY (\`mapsetId\`) REFERENCES \`mapsets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`assets\` ADD CONSTRAINT \`FK_c01f933a34e086ca57e5223bad1\` FOREIGN KEY (\`mapsetId\`) REFERENCES \`mapsets\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD CONSTRAINT \`FK_b054509707208f3971234785139\` FOREIGN KEY (\`beatmapId\`) REFERENCES \`beatmaps\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`participant\` DROP FOREIGN KEY \`FK_b054509707208f3971234785139\``);
        await queryRunner.query(`ALTER TABLE \`assets\` DROP FOREIGN KEY \`FK_c01f933a34e086ca57e5223bad1\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP FOREIGN KEY \`FK_3b9bb91032dc978aefd964d238d\``);
        await queryRunner.query(`ALTER TABLE \`participant\` CHANGE \`beatmapId\` \`beatmapId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD CONSTRAINT \`FK_b054509707208f3971234785139\` FOREIGN KEY (\`beatmapId\`) REFERENCES \`beatmaps\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` CHANGE \`access\` \`access\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`mapsets\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`mapsets\` ADD \`id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`mapsets\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`assets\` ADD CONSTRAINT \`FK_c01f933a34e086ca57e5223bad1\` FOREIGN KEY (\`mapsetId\`) REFERENCES \`mapsets\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD CONSTRAINT \`FK_3b9bb91032dc978aefd964d238d\` FOREIGN KEY (\`mapsetId\`) REFERENCES \`mapsets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`data\` json NULL`);
    }

}
