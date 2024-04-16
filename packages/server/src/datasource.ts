import { DataSource, DataSourceOptions } from 'typeorm';
import { isProduction } from './utils/env';
import * as process from 'process';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../../../.env'),
});

export const dbdatasource: DataSourceOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST ?? 'mysql',
  port: parseInt(process.env.MYSQL_PORT ?? '3306'),
  username: process.env.MYSQL_USER ?? 'osucad',
  password: process.env.MYSQL_PASSWORD ?? 'osucad',
  database: process.env.MYSQL_DATABASE ?? 'osucad',
  synchronize: false,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/tasks/migrations/*.js'],
  migrationsTableName: 'task_migrations',
  migrationsRun: isProduction,
};

const dataSource = new DataSource(dbdatasource);
export default dataSource;
