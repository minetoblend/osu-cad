import { DataSource } from 'typeorm';

import { BeatmapEntity } from './beatmap.entity';
import { join } from 'path';

import { isMainThread, workerData } from 'worker_threads';

let datasource!: DataSource;

async function initialize() {
  datasource = new DataSource({
    type: 'better-sqlite3',
    database: isMainThread
      ? join((await import('electron')).app.getPath('userData'), 'osucad.db')
      : workerData.database,
    entities: [BeatmapEntity],
    synchronize: true,
  });

  await datasource.initialize();

  return datasource;
}

const initialized = initialize();

export async function getDataSource() {
  await initialized;
  return datasource;
}
