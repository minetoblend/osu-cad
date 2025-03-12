import type { Provider } from 'nconf';
import { DataSource } from 'typeorm';
import { BeatmapSnapshot } from './entities/BeatmapSnapshot';
import { HitObject } from './entities/HitObject';
import { User } from './entities/User';

export async function createDatasource(config: Provider) {
  const datasource = new DataSource({
    type: 'better-sqlite3',
    database: ':memory:',
    dropSchema: true,
    entities: [
      User,
      HitObject,
      BeatmapSnapshot,
    ],
    synchronize: true,
  });

  await datasource.initialize();

  return datasource;
}
