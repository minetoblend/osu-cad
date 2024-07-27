import { Injectable } from '@nestjs/common';
import { MapsetEntity } from './mapset.entity';
import { MapsetBeatmapInfo, MapsetInfo } from '@osucad/common';
import { ImagesService } from '../assets/images.service';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class MapsetTransformer {
  constructor(
    private readonly imageService: ImagesService,
    private readonly assetsService: AssetsService,
  ) {}

  async transform(mapset: MapsetEntity): Promise<MapsetInfo> {
    const beatmaps = await Promise.all(
      mapset.beatmaps.map<Promise<MapsetBeatmapInfo>>(async (beatmap) => {
        return {
          id: beatmap.uuid,
          name: beatmap.name,
          starRating: beatmap.starRating,
          creator: mapset.creator.getInfo(),
          previewTime: beatmap.previewTime,
          links: {
            self: '/api/beatmaps/' + beatmap.uuid,
            edit: '/edit/' + beatmap.shareId,
            thumbnailSmall: this.imageService.getImageUrl(
              beatmap.thumbnailId,
              'thumbnail',
            ),
            thumbnailLarge: this.imageService.getImageUrl(
              beatmap.thumbnailId,
              'public',
            ),
            audioUrl: beatmap.audioFile
              ? await this.assetsService.getS3AssetUrl(beatmap.audioFile)
              : null,
          },
        };
      }),
    );

    const thumbnailSmall =
      beatmaps.map((it) => it.links.thumbnailSmall).find((it) => it) ?? null;
    const thumbnailLarge =
      beatmaps.map((it) => it.links.thumbnailLarge).find((it) => it) ?? null;

    return {
      id: mapset.id,
      title: mapset.title,
      artist: mapset.artist,
      tags: mapset.tags,
      createdAt: mapset.createdAt.toISOString(),
      updatedAt: mapset.updatedAt.toISOString(),
      creator: mapset.creator.getInfo(),
      beatmaps,
      links: {
        self: `/api/mapsets/${mapset.id}`,
        thumbnailSmall: thumbnailSmall,
        thumbnailLarge: thumbnailLarge,
      },
    };
  }
}
