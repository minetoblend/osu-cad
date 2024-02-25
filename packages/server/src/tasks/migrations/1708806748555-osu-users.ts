/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class OsuUsers1708806748555 implements MigrationInterface {
    name = 'OsuUsers1708806748555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`participant\` DROP FOREIGN KEY \`FK_b915e97dea27ffd1e40c8003b3b\``,);
        await queryRunner.query(`DROP INDEX \`IDX_b915e97dea27ffd1e40c8003b3\` ON \`participant\``);
        await queryRunner.query(`CREATE TABLE \`osu_users\` (\`id\` int NOT NULL, \`username\` varchar(255) NOT NULL, \`avatarUrl\` varchar(255) NOT NULL, \`created\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`participant\` DROP COLUMN \`username\``);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD CONSTRAINT \`FK_b915e97dea27ffd1e40c8003b3b\` FOREIGN KEY (\`userId\`) REFERENCES \`osu_users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`participant\` DROP FOREIGN KEY \`FK_b915e97dea27ffd1e40c8003b3b\``);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD \`username\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`osu_users\``);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD CONSTRAINT \`FK_b915e97dea27ffd1e40c8003b3b\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,);
        await queryRunner.query(`CREATE INDEX \`IDX_b915e97dea27ffd1e40c8003b3\` ON \`participant\` (\`userId\`)`);
    }

}
