import { forwardRef, Module } from '@nestjs/common';
import { BeatmapImportProcessor } from './beatmap-import.processor';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BeatmapModule } from '../beatmap.module';
import { BeatmapImportController } from './beatmap-import.controller';
import { BeatmapImportService } from './beatmap-import.service';
import { UserModule } from '../../users/user.module';
import { AssetsModule } from '../../assets/assets.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeatmapEntity } from '../beatmap.entity';
import { MapsetEntity } from '../mapset.entity';

@Module({
  imports: [
    forwardRef(() => BeatmapModule),
    forwardRef(() => UserModule),
    forwardRef(() => AssetsModule),
    TypeOrmModule.forFeature([BeatmapEntity, MapsetEntity]),
    BullModule.registerQueue({
      name: BeatmapImportProcessor.queueName,
    }),
    BullBoardModule.forFeature({
      name: BeatmapImportProcessor.queueName,
      adapter: BullAdapter,
    }),
  ],
  controllers: [BeatmapImportController],
  providers: [BeatmapImportService, BeatmapImportProcessor],
  exports: [],
})
export class BeatmapImportModule {}
