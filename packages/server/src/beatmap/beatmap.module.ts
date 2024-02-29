import { forwardRef, Module } from '@nestjs/common';
import { BeatmapService } from './beatmap.service';
import { MapsetController } from './mapset.controller';
import { BeatmapImportService } from './beatmap-import.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapsetEntity } from './mapset.entity';
import { BeatmapEntity } from './beatmap.entity';
import { UserModule } from '../users/user.module';
import { ParticipantEntity } from './participant.entity';
import { EditorSessionEntity } from '../editor/editor-session.entity';
import { BeatmapExportService } from './beatmap-export.service';
import { EditorModule } from '../editor/editor.module';
import { AssetsModule } from '../assets/assets.module';
import { BeatmapSnapshotEntity } from './beatmap-snapshot.entity';
import { BeatmapSnapshotService } from './beatmap-snapshot.service';
import { BeatmapPermissionsService } from './beatmap-permissions.service';
import { BeatmapController } from './beatmap.controller';
import { OsuUserEntity } from '../osu/osu-user.entity';
import { BullModule } from '@nestjs/bull';
import { BeatmapThumbnailProcessor } from './beatmap-thumbnail.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { MapsetTransformer } from './mapset.transformer';
import { BeatmapTransformer } from './beatmapTransformer';
import { BeatmapMigrator } from './beatmap-migrator';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MapsetEntity,
      BeatmapEntity,
      ParticipantEntity,
      EditorSessionEntity,
      BeatmapSnapshotEntity,
      OsuUserEntity,
    ]),
    UserModule,
    forwardRef(() => EditorModule),
    forwardRef(() => AssetsModule),
    BullModule.registerQueue({
      name: 'beatmap-thumbnail',
    }),
    BullBoardModule.forFeature({
      name: 'beatmap-thumbnail',
      adapter: BullAdapter,
    }),
  ],
  providers: [
    BeatmapService,
    BeatmapImportService,
    BeatmapExportService,
    BeatmapSnapshotService,
    BeatmapPermissionsService,
    BeatmapThumbnailProcessor,
    BeatmapTransformer,
    MapsetTransformer,
    BeatmapMigrator,
  ],
  controllers: [MapsetController, BeatmapController],
  exports: [
    BeatmapService,
    BeatmapSnapshotService,
    BeatmapPermissionsService,
    BeatmapMigrator,
  ],
})
export class BeatmapModule {}
