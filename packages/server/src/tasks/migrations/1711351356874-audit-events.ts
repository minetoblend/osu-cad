/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditEvents1711351356874 implements MigrationInterface {
  name = 'AuditEvents1711351356874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`audit_event\` (\`id\` int NOT NULL AUTO_INCREMENT, \`action\` varchar(64) NOT NULL, \`details\` json NOT NULL, \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    await queryRunner.query(`ALTER TABLE \`audit_event\` ADD CONSTRAINT \`FK_33c3131edaf1292ed22c59cd88b\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`audit_event\` DROP FOREIGN KEY \`FK_33c3131edaf1292ed22c59cd88b\``);
    await queryRunner.query(`DROP TABLE \`audit_event\``);
  }
}
