/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAudioFileToBeatmap1721431870372 implements MigrationInterface {
    name = 'AddAudioFileToBeatmap1721431870372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD \`audioFileKey\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD CONSTRAINT \`FK_2dad9dcf9300baef9095d0793a9\` FOREIGN KEY (\`audioFileKey\`) REFERENCES \`s3_assets\`(\`key\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP FOREIGN KEY \`FK_2dad9dcf9300baef9095d0793a9\``);
        await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP COLUMN \`audioFileKey\``);
    }

}
