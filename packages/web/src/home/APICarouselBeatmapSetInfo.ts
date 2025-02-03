import type { APIBeatmap, APIBeatmapCovers, APIBeatmapSet, CarouselBeatmapInfo, CarouselBeatmapSetInfo } from '@osucad/core';
import type { Texture } from 'pixi.js';
import { Action, loadTexture } from '@osucad/framework';

export class APICarouselBeatmapSetInfo implements CarouselBeatmapSetInfo {
  constructor(beatmapSet: APIBeatmapSet) {
    this.id = beatmapSet.id;
    this.artist = beatmapSet.artist;
    this.title = beatmapSet.title;
    this.authorName = beatmapSet.beatmaps[0].creator;
    this.beatmaps = beatmapSet.beatmaps.map(beatmap => new APICarouselBeatmapInfo(this, beatmap));

    this.covers = this.beatmaps.find(it => !!it.covers)?.covers ?? null;
  }

  readonly id: string;
  readonly artist: string;
  readonly title: string;
  readonly authorName: string;
  readonly beatmaps: APICarouselBeatmapInfo[];
  readonly covers: ApiCarouselCovers | null;

  async loadThumbnailSmall() {
    return this.covers?.loadListCover() ?? null;
  }

  async loadThumbnailLarge() {
    return this.covers?.loadLargeCover() ?? null;
  }
}

export class APICarouselBeatmapInfo implements CarouselBeatmapInfo {
  constructor(mapset: APICarouselBeatmapSetInfo, beatmap: APIBeatmap) {
    const { id, artist, title, creator, audioUrl, covers, difficultyName } = beatmap;

    this.id = id;
    this.artist = artist;
    this.title = title;
    this.authorName = creator;
    this.difficultyName = difficultyName;
    this.audioUrl = audioUrl;
    this.audioUrl = audioUrl;
    this.lastEdited = null;
    this.previewPoint = null;
    this.mapset = mapset;
    this.starRating = 0;
    this.setId = mapset.id;

    this.covers = covers
      ? new ApiCarouselCovers(covers)
      : null;
  }

  readonly artist: string;
  readonly audioUrl: string;
  readonly authorName: string;
  readonly difficultyName: string;
  readonly id: string;
  readonly lastEdited: Date | null;
  readonly covers: ApiCarouselCovers | null;

  async loadThumbnailSmall(): Promise<Texture | null> {
    return this.covers?.loadListCover() ?? null;
  }

  async loadThumbnailLarge(): Promise<Texture | null> {
    return this.covers?.loadLargeCover() ?? null;
  }

  mapset: CarouselBeatmapSetInfo | null;

  readonly previewPoint: number | null;

  select(): void {
    this.selected.emit(this);
  }

  readonly setId: string;
  readonly starRating: number;
  readonly title: string;

  readonly selected = new Action<APICarouselBeatmapInfo>();
}

class ApiCarouselCovers {
  constructor(readonly covers: APIBeatmapCovers) {
  }

  loadLargeCover() {
    return loadTexture(this.covers.large);
  }

  loadListCover() {
    return loadTexture(this.covers.list);
  }
}
