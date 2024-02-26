/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class RoomEntity1708904809368 implements MigrationInterface {
    name = 'RoomEntity1708904809368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`editor_room\` (\`id\` varchar(36) NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`beginDate\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`endDate\` timestamp NULL, \`beatmapId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`editor_session\` ADD \`duration\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`editor_session\` ADD \`roomId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`editor_room\` ADD CONSTRAINT \`FK_0e1ee5d1a56f69669d206b7cc92\` FOREIGN KEY (\`beatmapId\`) REFERENCES \`beatmaps\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`editor_session\` ADD CONSTRAINT \`FK_8c2947d04e2530377ebd844fd9f\` FOREIGN KEY (\`roomId\`) REFERENCES \`editor_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`editor_session\` DROP FOREIGN KEY \`FK_8c2947d04e2530377ebd844fd9f\``);
        await queryRunner.query(`ALTER TABLE \`editor_room\` DROP FOREIGN KEY \`FK_0e1ee5d1a56f69669d206b7cc92\``);
        await queryRunner.query(`ALTER TABLE \`editor_session\` DROP COLUMN \`roomId\``);
        await queryRunner.query(`ALTER TABLE \`editor_session\` DROP COLUMN \`duration\``);
        await queryRunner.query(`DROP TABLE \`editor_room\``);
    }

}
