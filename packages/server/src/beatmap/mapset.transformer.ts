import { Injectable } from '@nestjs/common';
import { MapsetEntity } from './mapset.entity';
import { MapsetInfo } from '@osucad/common';
import { AssetsService } from '../assets/assets.service';
import { BeatmapTransformer } from './beatmapTransformer';

@Injectable()
export class MapsetTransformer {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly beatmapTransformer: BeatmapTransformer,
  ) {}

  async transform(mapset: MapsetEntity): Promise<MapsetInfo> {
    const beatmaps = await Promise.all(
      mapset.beatmaps.map((beatmap) =>
        this.beatmapTransformer.transform(beatmap),
      ),
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
