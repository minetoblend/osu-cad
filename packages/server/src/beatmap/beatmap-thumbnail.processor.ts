import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { BeatmapService } from './beatmap.service';
import { BeatmapSnapshotService } from './beatmap-snapshot.service';
import { AssetsService } from '../assets/assets.service';
import { BeatmapEntity } from './beatmap.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ImagesService } from '../assets/images.service';

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
    private readonly imagesService: ImagesService,
  ) {}

  private assetMap = new Map<string, string>();

  @Process({ concurrency: 5 })
  async process(job: Job<BeatmapThumbnailJob>) {
    return this.createThumbnails(job.data);
  }

  async createThumbnails({ beatmapId }: BeatmapThumbnailJob) {
    try {
      const beatmap = await this.beatmapService.findById(beatmapId);
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
            thumbnailId: null,
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
            thumbnailId: null,
          },
        );

        return {
          error: 'Asset not found',
          beatmapId: beatmapId,
        };
      }

      const imageData = await this.assetService.getAssetContent(asset);

      if (!imageData) {
        await this.beatmapRepository.update(
          {
            id: beatmap.id,
          },
          {
            needsThumbnail: false,
            thumbnailId: null,
          },
        );

        return {
          error: 'Failed to get image data',
          beatmapId: beatmapId,
        };
      }

      const filename = asset.path.split('/').pop();

      if (!filename) {
        await this.beatmapRepository.update(
          {
            id: beatmap.id,
          },
          {
            needsThumbnail: false,
            thumbnailId: null,
          },
        );

        return {
          error: 'Failed to get filename',
          beatmapId: beatmapId,
        };
      }

      const id = 'beatmaps/thumbnails/' + beatmap.uuid.toString();

      const response = await this.imagesService.uploadImage(
        id,
        filename,
        imageData,
        {
          type: 'beatmap-thumbnail',
          beatmapId: beatmap.id.toString(),
        },
      );

      const { success, result } = response;

      if (!success) {
        await this.beatmapRepository.update(
          {
            id: beatmap.id,
          },
          {
            needsThumbnail: false,
          },
        );
        return {
          error: 'Failed to upload image',
          beatmapId: beatmapId,
        };
      }

      await this.beatmapRepository.update(
        {
          id: beatmap.id,
        },
        {
          thumbnailId: result.id,
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

  getImageUrl(id: string) {
    return `https://imagedelivery.net/${id}`;
  }
}
