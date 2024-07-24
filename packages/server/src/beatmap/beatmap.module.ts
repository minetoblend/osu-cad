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
import { BeatmapTransformer } from './beatmap.transformer';
import { BeatmapMigrator } from './beatmap-migrator';
import { BeatmapLastAccessEntity } from './beatmap-last-access.entity';
import { BeatmapImportModule } from './import/beatmap-import.module';
import { MapsetService } from './mapset.service';
import { BeatmapDifficultyProcessor } from './beatmap-difficulty.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MapsetEntity,
      BeatmapEntity,
      ParticipantEntity,
      EditorSessionEntity,
      BeatmapSnapshotEntity,
      OsuUserEntity,
      BeatmapLastAccessEntity,
    ]),
    UserModule,
    forwardRef(() => EditorModule),
    forwardRef(() => AssetsModule),
    forwardRef(() => BeatmapImportModule),
    BullModule.registerQueue({
      name: 'beatmap-thumbnail',
      defaultJobOptions: {
        delay: 1000,
      },
    }),
    BullBoardModule.forFeature({
      name: 'beatmap-thumbnail',
      adapter: BullAdapter,
    }),
    BullModule.registerQueue({
      name: 'beatmap-difficulty',
    }),
    BullBoardModule.forFeature({
      name: 'beatmap-difficulty',
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
    BeatmapDifficultyProcessor,
    BeatmapTransformer,
    MapsetTransformer,
    BeatmapMigrator,
    MapsetService,
  ],
  controllers: [MapsetController, BeatmapController],
  exports: [
    BeatmapService,
    BeatmapSnapshotService,
    BeatmapPermissionsService,
    BeatmapMigrator,
    MapsetService,
    BeatmapDifficultyProcessor,
  ],
})
export class BeatmapModule {}
