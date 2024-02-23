import { forwardRef, Module } from "@nestjs/common";
import { EditorGateway } from "./editor.gateway";
import { EditorRoomManager } from "./editor.room.manager";
import { BeatmapModule } from "../beatmap/beatmap.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EditorSessionEntity } from "./editor-session.entity";

@Module({
  imports: [
    forwardRef(() => BeatmapModule),
    TypeOrmModule.forFeature([EditorSessionEntity]),
  ],
  providers: [EditorGateway, EditorRoomManager],
  exports: [EditorRoomManager],
})
export class EditorModule {}
