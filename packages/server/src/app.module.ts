import {MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
import {BeatmapModule} from "./beatmap/beatmap.module";
import {UserModule} from "./users/user.module";
import {AuthModule} from "./auth/auth.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {EditorModule} from "./editor/editor.module";
import {OsuModule} from "./osu/osu.module";
import * as path from "path";
import {ConfigModule} from "@nestjs/config";
import {ServeStaticModule} from "@nestjs/serve-static";
import {PreferencesModule} from './preferences/preferences.module';
import {MongooseModule} from '@nestjs/mongoose';
import {AppLoggerMiddleware} from './app-logger.middleware';
import {dbdatasource} from "./datasource";
import {AppController} from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, "../../../.env"),
    }),
    TypeOrmModule.forRoot(dbdatasource),
    MongooseModule.forRoot('mongodb://mongodb:27017/osucad'),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, "../../client/dist"),
    }),
    BeatmapModule,
    UserModule,
    AuthModule,
    EditorModule,
    OsuModule,
    PreferencesModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}

