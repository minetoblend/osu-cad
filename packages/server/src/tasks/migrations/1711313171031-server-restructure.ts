/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class ServerRestructure1711313171031 implements MigrationInterface {
    name = 'ServerRestructure1711313171031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`beatmap_last_access\` (\`userId\` int NOT NULL, \`beatmapId\` int NOT NULL, \`date\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX \`IDX_9de17a5e8f0ad64ffeb5c745f8\` (\`date\`), PRIMARY KEY (\`userId\`, \`beatmapId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`mapsets\` ADD \`deleted\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`deleted\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`thumbnailId\` varchar(255) NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_abccf7f47c9a052c0050395ce7\` ON \`mapsets\` (\`createdAt\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_3d85dfd748b6b248c1a9fbe6b8\` ON \`mapsets\` (\`updatedAt\`)`);
        await queryRunner.query(`ALTER TABLE \`beatmap_last_access\` ADD CONSTRAINT \`FK_25a510ed443422b61fbce0385f8\` FOREIGN KEY (\`beatmapId\`) REFERENCES \`beatmaps\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`beatmap_last_access\` ADD CONSTRAINT \`FK_ad67e2511afe6e1c2d55a1b6244\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`beatmap_last_access\` DROP FOREIGN KEY \`FK_ad67e2511afe6e1c2d55a1b6244\``);
        await queryRunner.query(`ALTER TABLE \`beatmap_last_access\` DROP FOREIGN KEY \`FK_25a510ed443422b61fbce0385f8\``);
        await queryRunner.query(`DROP INDEX \`IDX_3d85dfd748b6b248c1a9fbe6b8\` ON \`mapsets\``);
        await queryRunner.query(`DROP INDEX \`IDX_abccf7f47c9a052c0050395ce7\` ON \`mapsets\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`thumbnailId\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`deleted\``);
        await queryRunner.query(`ALTER TABLE \`mapsets\` DROP COLUMN \`deleted\``);
        await queryRunner.query(`DROP INDEX \`IDX_9de17a5e8f0ad64ffeb5c745f8\` ON \`beatmap_last_access\``);
        await queryRunner.query(`DROP TABLE \`beatmap_last_access\``);
    }

}
