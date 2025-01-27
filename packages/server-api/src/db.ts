import { Sequelize } from 'sequelize';

export function createDb() {
  const db = new Sequelize('sqlite::memory:');

  return { db };
}

export type Db = ReturnType<typeof createDb>;
