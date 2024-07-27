import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClientToken1721606514069 implements MigrationInterface {
    name = 'AddClientToken1721606514069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`client_token\` (\`token\` char(36) NOT NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`expires_at\` timestamp NOT NULL, \`used_at\` timestamp NULL, \`userId\` int NULL, PRIMARY KEY (\`token\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`data\``);
        await queryRunner.query(`ALTER TABLE \`client_token\` ADD CONSTRAINT \`FK_7ccf946259d113ab393cd178498\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`client_token\` DROP FOREIGN KEY \`FK_7ccf946259d113ab393cd178498\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`data\` json NULL`);
        await queryRunner.query(`DROP TABLE \`client_token\``);
    }

}
