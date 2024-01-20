import {forwardRef, Module} from "@nestjs/common";
import {BeatmapService} from "./beatmap.service";
import {MapsetController} from "./mapset.controller";
import {BeatmapImportService} from "./beatmap-import.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {MapsetEntity} from "./mapset.entity";
import {BeatmapEntity} from "./beatmap.entity";
import {UserModule} from "../users/user.module";
import {ParticipantEntity} from "./participant.entity";
import {EditorSessionEntity} from "../editor/editor-session.entity";
import {BeatmapExportService} from "./beatmap-export.service";
import {EditorModule} from "../editor/editor.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MapsetEntity,
      BeatmapEntity,
      ParticipantEntity,
      EditorSessionEntity,
    ]),
    UserModule,
    forwardRef(() => EditorModule),
  ],
  providers: [BeatmapService, BeatmapImportService, BeatmapExportService],
  controllers: [MapsetController],
  exports: [BeatmapService],
})
export class BeatmapModule {
}
