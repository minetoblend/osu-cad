import {MiddlewareConsumer, Module, NestModule, RequestMethod} from "@nestjs/common";
import {FrontendMiddleware} from "./frontend.middleware";
import {BeatmapModule} from "./beatmap/beatmap.module";
import {UserModule} from "./users/user.module";
import {AuthModule} from "./auth/auth.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "./users/user.entity";
import {MapsetEntity} from "./beatmap/mapset.entity";
import {BeatmapEntity} from "./beatmap/beatmap.entity";
import {EditorModule} from "./editor/editor.module";
import {OsuModule} from "./osu/osu.module";
import * as path from "path";
import {EditorSessionEntity} from "./editor/editor-session.entity";
import {ConfigModule} from "@nestjs/config";
import {ServeStaticModule} from "@nestjs/serve-static";
import {PreferencesModule} from './preferences/preferences.module';
import {MongooseModule} from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, "../../../.env"),
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "osucad",
      password: "osucad",
      database: "osucad2",
      entities: [UserEntity, MapsetEntity, BeatmapEntity, EditorSessionEntity],
      synchronize: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/osucad'),
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
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(FrontendMiddleware)
        .exclude("api/(.*)", "auth/(.*)", "assets/(.*)", "phaseVocoder.js", "hitsounds/(.*)", "src/(.*)")
        .forRoutes({
          path: "/**",
          method: RequestMethod.GET,
        });
  }
}
