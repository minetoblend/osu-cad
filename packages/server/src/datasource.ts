import {DataSource, DataSourceOptions} from 'typeorm';
import {isProduction} from "./utils/env";

export const dbdatasource: DataSourceOptions = {
  type: 'mysql',
  host: 'mysql',
  port: 3306,
  username: 'osucad',
  password: 'test',
  database: 'osucad',
  synchronize: false,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/tasks/migrations/*.js'],
  migrationsTableName: 'task_migrations',
  migrationsRun: isProduction,
};

const dataSource = new DataSource(dbdatasource)
export default dataSource
