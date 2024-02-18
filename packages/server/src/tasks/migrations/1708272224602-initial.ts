import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1708272224602 implements MigrationInterface {
  name = 'Initial1708272224602'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL, \`username\` varchar(255) NOT NULL, \`avatarUrl\` varchar(255) NOT NULL, \`created\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`beatmaps\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`osuId\` int NULL, \`starRating\` float NOT NULL, \`uuid\` varchar(36) NOT NULL, \`data\` json NOT NULL, \`mapsetId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`mapsets\` (\`id\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`artist\` varchar(255) NOT NULL, \`osuId\` int NULL, \`tags\` text NOT NULL, \`background\` varchar(255) NULL, \`access\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`creatorId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`participant\` (\`id\` varchar(36) NOT NULL, \`access\` int NOT NULL, \`mapsetId\` varchar(36) NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE \`editor_session\` (\`id\` int NOT NULL AUTO_INCREMENT, \`beginDate\` datetime NOT NULL, \`endDate\` datetime NOT NULL, \`beatmapId\` int NULL, \`userId\` int NULL, INDEX \`IDX_5f20bdf76c3f847c96b3a27119\` (\`beginDate\`), INDEX \`IDX_35c79b81470ed6a03c86875f17\` (\`endDate\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    await queryRunner.query(`ALTER TABLE \`beatmaps\` ADD CONSTRAINT \`FK_3b9bb91032dc978aefd964d238d\` FOREIGN KEY (\`mapsetId\`) REFERENCES \`mapsets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`mapsets\` ADD CONSTRAINT \`FK_b5965bba0a3c8c2a540ba42a00b\` FOREIGN KEY (\`creatorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`participant\` ADD CONSTRAINT \`FK_75f20e120c3ae061f0ecfcd2a3d\` FOREIGN KEY (\`mapsetId\`) REFERENCES \`mapsets\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`participant\` ADD CONSTRAINT \`FK_b915e97dea27ffd1e40c8003b3b\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`editor_session\` ADD CONSTRAINT \`FK_30e639dce05c68c1875454efc5c\` FOREIGN KEY (\`beatmapId\`) REFERENCES \`beatmaps\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE \`editor_session\` ADD CONSTRAINT \`FK_b4f3e5d237090bd6c20f719fe44\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`editor_session\` DROP FOREIGN KEY \`FK_b4f3e5d237090bd6c20f719fe44\``);
    await queryRunner.query(`ALTER TABLE \`editor_session\` DROP FOREIGN KEY \`FK_30e639dce05c68c1875454efc5c\``);
    await queryRunner.query(`ALTER TABLE \`participant\` DROP FOREIGN KEY \`FK_b915e97dea27ffd1e40c8003b3b\``);
    await queryRunner.query(`ALTER TABLE \`participant\` DROP FOREIGN KEY \`FK_75f20e120c3ae061f0ecfcd2a3d\``);
    await queryRunner.query(`ALTER TABLE \`mapsets\` DROP FOREIGN KEY \`FK_b5965bba0a3c8c2a540ba42a00b\``);
    await queryRunner.query(`ALTER TABLE \`beatmaps\` DROP FOREIGN KEY \`FK_3b9bb91032dc978aefd964d238d\``);
    await queryRunner.query(`DROP INDEX \`IDX_35c79b81470ed6a03c86875f17\` ON \`editor_session\``);
    await queryRunner.query(`DROP INDEX \`IDX_5f20bdf76c3f847c96b3a27119\` ON \`editor_session\``);
    await queryRunner.query(`DROP TABLE \`editor_session\``);
    await queryRunner.query(`DROP TABLE \`participant\``);
    await queryRunner.query(`DROP TABLE \`mapsets\``);
    await queryRunner.query(`DROP TABLE \`beatmaps\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }

}
