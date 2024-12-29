import { BeatmapStore, LoadedBeatmap } from '@osucad/editor';
import { BeatmapItemInfo } from 'packages/editor/src/beatmapSelect/BeatmapItemInfo';
import { StableLoadedBeatmap } from './StableLoadedBeatmap';
import { MapsetInfo } from '@osucad/editor/beatmapSelect/MapsetInfo';
import { createBeatmapManagerProxy } from './BeatmapManagerProxy';
import { IBeatmapEntity } from '../../types/IBeatmapManager';
import { almostEquals, Action, loadTexture } from 'osucad-framework';
import { IBeatmap, IResourcesProvider, StableBeatmapEncoder } from '@osucad/common';

export class StableBeatmapStore extends BeatmapStore {

  readonly #beatmapManager = createBeatmapManagerProxy();

  async load() {
    if (!window.api.stableDetected) {
      console.warn('Stable not detected, skipping beatmap load');
      return;
    }

    const entities = await this.#beatmapManager.getAll();

    this.#beatmapManager.onUpdated((entities) => {
      console.log(entities);
      for (const entity of entities)
        this.#onBeatmapUpdated(entity);
    });

    this.#beatmapManager.onDeleted((ids) => {
      for (const id of ids) {
        const beatmap = this.beatmaps.value.find(it => it.id === id);
        if (beatmap)
          this.removed.emit(beatmap);
      }
    });

    console.log(`Found ${entities.length} beatmaps`);

    window.electron.ipcRenderer.on('beatmaps:importFinished', () => this.isImporting.value = false);

    this.isImporting.value = await window.electron.ipcRenderer.invoke('beatmaps:isImporting');

    console.log('is importing', this.isImporting.value);

    const beatmaps = entities.map(osuBeatmap => new StableBeatmapInfo(osuBeatmap));
    for (const beatmap of beatmaps)
      this.#beatmapLookup.set(beatmap.id, beatmap);

    this.beatmaps.value = beatmaps;
  }

  #beatmapLookup = new Map<string, StableBeatmapInfo>();

  #diffCalcTimeout?: any;

  #onBeatmapUpdated(entity: IBeatmapEntity) {
    let beatmap = this.#beatmapLookup.get(entity.id);
    if (!beatmap) {
      beatmap = new StableBeatmapInfo(entity);
      this.#beatmapLookup.set(beatmap.id, beatmap);
      this.beatmaps.value.push(beatmap);

      this.added.emit(beatmap);
    } else {
      if (!almostEquals(entity.starRating, beatmap.starRating)) {
        this.diffcalcActive.value = true;
        if (this.#diffCalcTimeout)
          clearTimeout(this.#diffCalcTimeout);

        this.#diffCalcTimeout = setTimeout(() => {
          this.diffcalcActive.value = false;
        }, 10_000);
      }

      beatmap.updateFromEntity(entity);
    }
  }

  save(id: string, beatmap: IBeatmap): Promise<boolean> {
    return this.#beatmapManager.saveBeatmap(id, new StableBeatmapEncoder().encode(beatmap));
  }

}

export class StableBeatmapInfo implements BeatmapItemInfo {
  constructor(entity: IBeatmapEntity) {
    this.id = entity.id;

    this.updateFromEntity(entity);
  }

  updateFromEntity(entity: IBeatmapEntity) {
    this.setId = entity.folderName;
    this.authorName = entity.creatorName;
    this.artist = entity.artist;
    this.title = entity.title;
    this.difficultyName = entity.difficultyName;
    this.starRating = entity.starRating;
    this.needsDiffcalc = entity.needsStarRatingUpdate;
    this.folderName = entity.folderName;
    this.osuFileName = entity.osuFileName;
    this.audioUrl = this.#relativePath(entity.audioFileName);
    this.#backgroundFileName = entity.backgroundFileName;

    this.previewPoint = entity.previewTime;

    this.invalidated.emit();
  }

  readonly invalidated = new Action();

  id!: string;

  setId!: string;

  authorName!: string;

  title!: string;

  difficultyName!: string;

  author = null;

  artist!: string;

  starRating!: number;

  audioUrl!: string;

  lastEdited!: Date | null;

  previewPoint!: number;

  needsDiffcalc!: boolean;

  #backgroundFileName!: string | null;

  #relativePath(path: string) {
    return `osu-stable://songs?path=${encodeURIComponent(this.folderName + '/' + path)}`;
  }

  async backgroundPath() {
    if (this.#backgroundFileName)
      return this.#relativePath(this.#backgroundFileName);

    return null;
  }

  async loadThumbnailSmall() {
    if (this.#backgroundFileName)
      return loadTexture(this.#relativePath(this.#backgroundFileName));

    return null;
  }

  async loadThumbnailLarge() {
    if (this.#backgroundFileName)
      return loadTexture(this.#relativePath(this.#backgroundFileName), undefined, {
        resize: {
          width: 720,
          height: 200,
          mode: 'fill',
        },
      });

    return null;
  }

  folderName!: string;

  osuFileName!: string;

  async load(resources: IResourcesProvider): Promise<LoadedBeatmap> {
    const beatmap = new StableLoadedBeatmap(this);

    await beatmap.load(resources);

    return beatmap;
  }

  mapset: MapsetInfo | null = null;
}
