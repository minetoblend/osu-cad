import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { BeatmapEntity } from './beatmap.entity';
import { join } from 'path';

import { isMainThread, workerData } from 'worker_threads';
import { InitialSchemaMigration } from './migrations/01-initial-schema';

let datasource!: DataSource;

async function initialize() {
  datasource = new DataSource({
    type: 'better-sqlite3',
    database: isMainThread
      ? join((await import('electron')).app.getPath('userData'), 'osucad.db')
      : workerData.database,
    migrations: [InitialSchemaMigration],
    entities: [BeatmapEntity],
    synchronize: false,
    migrationsRun: true,
    namingStrategy: new SnakeNamingStrategy()
  });

  await datasource.initialize();

  return datasource;
}

const initialized = initialize();

export async function getDataSource() {
  await initialized;
  return datasource;
}
