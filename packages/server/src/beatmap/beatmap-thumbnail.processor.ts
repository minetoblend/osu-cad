import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { BeatmapService } from './beatmap.service';
import { BeatmapSnapshotService } from './beatmap-snapshot.service';
import { AssetsService } from '../assets/assets.service';
import * as sharp from 'sharp';
import { BeatmapEntity } from './beatmap.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

export interface BeatmapThumbnailJob {
  beatmapId: number;
}

@Processor('beatmap-thumbnail')
@Injectable()
export class BeatmapThumbnailProcessor {
  constructor(
    private readonly beatmapService: BeatmapService,
    private readonly snapshotService: BeatmapSnapshotService,
    private readonly assetService: AssetsService,
    @InjectRepository(BeatmapEntity)
    private readonly beatmapRepository: Repository<BeatmapEntity>,
  ) {}

  private assetMap = new Map<string, string>();

  @Process()
  async process(job: Job<BeatmapThumbnailJob>) {
    return this.createThumbnails(job.data);
  }

  async createThumbnails({ beatmapId }: BeatmapThumbnailJob) {
    try {
      const beatmap = await this.beatmapService.findBeatmapById(beatmapId);
      if (!beatmap) {
        return {
          error: 'Beatmap not found',
          beatmapId: beatmapId,
        };
      }

      if (!beatmap.needsThumbnail) {
        return {
          success: true,
          message: 'Beatmap does not need thumbnail',
          beatmapId: beatmapId,
        };
      }

      const snapshot = await this.snapshotService.getLatestSnapshot(beatmap);

      if (!snapshot) {
        return {
          error: 'Snapshot not found',
          beatmapId: beatmapId,
        };
      }

      const backgroundPath = snapshot.data.backgroundPath;

      if (!backgroundPath) {
        await this.beatmapRepository.update(
          {
            id: beatmap.id,
          },
          {
            needsThumbnail: false,
            thumbnailSmall: null,
            thumbnailLarge: null,
          },
        );

        return {
          error: 'Background not found',
          beatmapId: beatmapId,
        };
      }

      const asset = await this.assetService.getAsset(
        beatmap.mapset,
        backgroundPath,
      );

      if (!asset) {
        await this.beatmapRepository.update(
          {
            id: beatmap.id,
          },
          {
            needsThumbnail: false,
            thumbnailSmall: null,
            thumbnailLarge: null,
          },
        );

        return {
          error: 'Asset not found',
          beatmapId: beatmapId,
        };
      }

      const imageData = await this.assetService.getAssetContent(asset);

      const largeThumbnail = await sharp(imageData)
        .resize({
          width: 960,
          height: 720,
          fit: 'cover',
          position: 'center',
        })
        .toFormat('webp')
        .toBuffer();

      const smallThumbnail = await sharp(imageData)
        .resize({
          width: 320,
          height: 240,
          fit: 'cover',
          position: 'center',
        })
        .toFormat('webp')
        .toBuffer();

      const largeThumbnailAsset =
        await this.assetService.getAndIncreaseRefcount(
          largeThumbnail,
          beatmap.thumbnailLarge,
        );

      const smallThumbnailAsset =
        await this.assetService.getAndIncreaseRefcount(
          smallThumbnail,
          beatmap.thumbnailSmall,
        );

      await this.beatmapRepository.update(
        {
          id: beatmap.id,
        },
        {
          thumbnailSmall: smallThumbnailAsset,
          thumbnailLarge: largeThumbnailAsset,
          needsThumbnail: false,
        },
      );

      return {
        success: true,
        beatmapId: beatmapId,
      };
    } catch (e) {
      console.error(e);
      return {
        error: e.message,
        beatmapId: beatmapId,
      };
    }
  }
}
