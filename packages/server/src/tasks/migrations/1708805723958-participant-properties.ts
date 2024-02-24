/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class ParticipantProperties1708805723958 implements MigrationInterface {
    name = 'ParticipantProperties1708805723958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`participant\` DROP FOREIGN KEY \`FK_b054509707208f3971234785139\``);
        await queryRunner.query(`DROP INDEX \`FK_b054509707208f3971234785139\` ON \`participant\``);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD \`username\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`participant\` CHANGE \`userId\` \`userId\` int NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_b915e97dea27ffd1e40c8003b3\` ON \`participant\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD CONSTRAINT \`FK_b054509707208f3971234785139\` FOREIGN KEY (\`beatmapId\`) REFERENCES \`beatmaps\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`participant\` DROP FOREIGN KEY \`FK_b054509707208f3971234785139\``);
        await queryRunner.query(`DROP INDEX \`IDX_b915e97dea27ffd1e40c8003b3\` ON \`participant\``);
        await queryRunner.query(`ALTER TABLE \`participant\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`participant\` DROP COLUMN \`username\``);
        await queryRunner.query(`CREATE INDEX \`FK_b054509707208f3971234785139\` ON \`participant\` (\`beatmapId\`)`);
        await queryRunner.query(`ALTER TABLE \`participant\` ADD CONSTRAINT \`FK_b054509707208f3971234785139\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
