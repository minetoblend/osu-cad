import { Module } from '@nestjs/common';
import { BeatmapService } from './beatmap.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beatmap } from './beatmap.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Beatmap])],
  providers: [BeatmapService],
  exports: [BeatmapService],
})
export class BeatmapModule {}
