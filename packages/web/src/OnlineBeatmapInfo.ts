import type { UserInfo } from '@osucad/common';
import type { IResourcesProvider, LoadedBeatmap } from '@osucad/editor';
import type { MapsetInfo } from 'packages/editor/src/beatmapSelect/MapsetInfo';
import type { BeatmapItemInfo } from '../../editor/src/beatmapSelect/BeatmapItemInfo';
import { Action } from 'osucad-framework';
import { OnlineLazyResourceStore } from './OnlineLazyResourceStore';
import { OnlineLoadedBeatmap } from './OnlineLoadedBeatmap';

export class OnlineBeatmapInfo implements BeatmapItemInfo {
  invalidated = new Action();
  id: string = '';
  setId: string = '';
  author: UserInfo | null = null;
  authorName: string = '';
  artist: string = '';
  title: string = '';
  difficultyName: string = '';
  starRating = 0;
  backgroundPath = () => Promise.resolve(null);
  loadThumbnailSmall = () => Promise.resolve(null);
  loadThumbnailLarge = () => Promise.resolve(null);
  audioUrl: string = '';
  lastEdited = null;
  previewPoint = 0;

  async load(resources: IResourcesProvider): Promise<LoadedBeatmap> {
    const resourceStore = await OnlineLazyResourceStore.create();
    const beatmap = new OnlineLoadedBeatmap(resourceStore!);

    await beatmap.load(resources);

    return beatmap;
  }

  mapset: MapsetInfo | null = null;
  needsDiffcalc?: boolean | undefined = undefined;
}
