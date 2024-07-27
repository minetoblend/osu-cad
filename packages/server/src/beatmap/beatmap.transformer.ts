import { Injectable } from '@nestjs/common';
import { BeatmapEntity } from './beatmap.entity';
import { MapsetBeatmapInfo } from '@osucad/common';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class BeatmapTransformer {
  constructor(private readonly assetsService: AssetsService) {}

  async transform(beatmap: BeatmapEntity): Promise<MapsetBeatmapInfo> {
    let thumbnailSmall: string | null = null;
    if (beatmap.thumbnailSmall)
      thumbnailSmall = await this.assetsService.getS3AssetUrl(
        beatmap.thumbnailSmall,
      );

    let thumbnailLarge: string | null = null;
    if (beatmap.thumbnailLarge)
      thumbnailLarge = await this.assetsService.getS3AssetUrl(
        beatmap.thumbnailLarge,
      );

    return {
      id: beatmap.uuid,
      name: beatmap.name,
      starRating: beatmap.starRating,
      creator: beatmap.mapset.creator.getInfo(),
      previewTime: beatmap.previewTime,
      links: {
        self: `/api/beatmaps/${beatmap.uuid}`,
        edit: `/edit/${beatmap.shareId}`,
        thumbnailSmall,
        thumbnailLarge,
        audioUrl: await this.assetsService.getS3AssetUrl(beatmap.audioFile),
      },
    };
  }
}
