import { HttpException, Module } from '@nestjs/common';
import { BeatmapModule } from './beatmap/beatmap.module';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EditorModule } from './editor/editor.module';
import { OsuModule } from './osu/osu.module';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PreferencesModule } from './preferences/preferences.module';
import { MongooseModule } from '@nestjs/mongoose';
import { dbdatasource } from './datasource';
import { AppController } from './app.controller';
import { AssetsModule } from './assets/assets.module';
import { AdminModule } from './admin/admin.module';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullboardAuthMiddleware } from './bullboard-auth.middleware';
import { CacheModule } from '@nestjs/cache-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SentryInterceptor, SentryModule } from '@ntegral/nestjs-sentry';
import * as process from 'process';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../../.env'),
    }),
    SentryModule.forRoot({
      dsn: 'https://4f654a932c3f8c19509fc108e18235a2@o4506916793745408.ingest.us.sentry.io/4506920217935872',
      debug: true,
      environment: process.env.NODE_ENV,
      logLevels: ['debug'],
    }),
    TypeOrmModule.forRoot(dbdatasource),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get('MONGODB_HOST', 'mongodb');
        const port = config.get('MONGODB_PORT', 27017);
        return {
          uri: `mongodb://${host}:${port}/osucad`,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '../../client/dist'),
    }),
    BeatmapModule,
    UserModule,
    AuthModule,
    EditorModule,
    OsuModule,
    PreferencesModule,
    AssetsModule,
    AdminModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'redis'),
          port: config.get('REDIS_PORT', 6379),
          keyPrefix: 'osucad-jobs:',
        },
      }),
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
      middleware: BullboardAuthMiddleware,
    }),
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: () =>
        new SentryInterceptor({
          filters: [
            {
              type: HttpException,
              filter: (exception: HttpException) => 500 > exception.getStatus(),
            },
          ],
        }),
    },
  ],
})
export class AppModule {}
