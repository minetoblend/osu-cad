import {MiddlewareConsumer, Module, NestModule, RequestMethod} from "@nestjs/common";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";
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
    BeatmapModule, UserModule, AuthModule, EditorModule, OsuModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(FrontendMiddleware)
      .exclude("api/(.*)", "auth/(.*)", "assets/(.*)")
      .forRoutes({
        path: "/**",
        method: RequestMethod.GET,
      });
  }
}
