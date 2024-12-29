import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchemaMigration implements MigrationInterface {
  name = '01-InitialSchemaMigration-1729362872863'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('drop table if exists beatmap')
    await queryRunner.query(`
      create table beatmap (
        id varchar(36) primary key,
        unparseable integer default 0,
        folder_name varchar(256) not null,
        osu_file_name varchar(256) not null,
        osucad_file_name varchar(256) null,
        sha1 varchar(40) not null,

        metadata_version integer not null,
        artist varchar(256) not null,
        artist_unicode varchar(256) not null,
        title varchar(256) not null,
        title_unicode varchar(256) not null,
        difficulty_name varchar(256) not null,
        tags varchar(512) not null,
        creator_name varchar(128) not null,
        background_file_name varchar(256) null,
        audio_file_name varchar(256) default '',
        osu_web_id integer null,
        osu_web_mapset_id integer null,
        preview_time integer default 0,
        star_rating real default 0,

        needs_star_rating_update integer default 1,
        last_modified_date integer default 0,
        diffcalc_in_progress integer default 0
      )
    `)
    await queryRunner.query('create unique index beatmap_path_unique on beatmap(folder_name, osu_file_name)')
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('drop table if exists beatmap')
  }
}
