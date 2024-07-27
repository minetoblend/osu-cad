import { Process, Processor } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { BeatmapService } from './beatmap.service';
import { BeatmapSnapshotService } from './beatmap-snapshot.service';
import { Job } from 'bull';
import { BeatmapThumbnailJob } from './beatmap-thumbnail.processor';
import { BeatmapExportService } from './beatmap-export.service';
import { BeatmapEncoder } from 'osu-parsers';
//@ts-ignore
import * as Lazer from 'smoogipoo.osu-native';

export interface BeatmapDifficultyJob {
  beatmapId: number;
}

@Processor('beatmap-difficulty')
@Injectable()
export class BeatmapDifficultyProcessor implements OnModuleInit {
  constructor(
    private readonly beatmapService: BeatmapService,
    private readonly snapshotService: BeatmapSnapshotService,
    private readonly exportService: BeatmapExportService,
  ) {}

  async onModuleInit() {
    this.osu = await Lazer.create();
  }

  osu!: Lazer;

  @Process({ concurrency: 1 })
  async process(job: Job<BeatmapThumbnailJob>) {
    return this.calculateDifficulty(job.data);
  }

  async calculateDifficulty({ beatmapId }: BeatmapDifficultyJob) {
    const beatmap = await this.beatmapService.findById(beatmapId);

    if (!beatmap) {
      return {
        error: 'Beatmap not found',
        beatmapId: beatmapId,
      };
    }

    const latestSnapshot =
      await this.snapshotService.getLatestSnapshot(beatmap);

    if (!latestSnapshot) {
      return {
        error: 'Snapshot not found',
        beatmapId: beatmapId,
      };
    }

    const converted = this.exportService.convertBeatmap(
      beatmap,
      latestSnapshot.data,
    );

    const osuFile = new BeatmapEncoder().encodeToString(converted);

    const difficulty = await this.osu.computeDifficulty(osuFile, 0, 0);

    await this.beatmapService.updateBeatmap(beatmap, {
      starRating: difficulty,
      needsDiffCalc: false,
    });
  }
}
