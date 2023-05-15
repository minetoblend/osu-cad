import { EditorPreferences } from './editor/preferences/editor.preferences.entity';
import { AppLoggerMiddleware } from './app.logger';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { EditorModule } from './editor/editor.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { PulsarModule } from './pulsar/pulsar.module';
import { BeatmapModule } from './beatmap/beatmap.module';
import { S3Asset } from './shared/s3asset.entity';
import { SharedAsset } from './shared/shared.asset.entity';
import { Beatmap } from './beatmap/beatmap.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, EditorPreferences, S3Asset, SharedAsset, Beatmap],
        synchronize: !!configService.get('DB_SYNCHRONIZE'),
      }),
    }),
    AuthModule,
    UserModule,
    EditorModule,
    SharedModule,
    PulsarModule,
    BeatmapModule,
  ],
  providers: [AppLoggerMiddleware],
})
export class AppModule {}
