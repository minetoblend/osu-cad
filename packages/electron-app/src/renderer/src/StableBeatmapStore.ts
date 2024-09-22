import { BeatmapStore, EditorContext, loadTexture, StableBeatmapParser } from '@osucad/editor';
import { BeatmapItemInfo } from 'packages/editor/src/beatmapSelect/BeatmapItemInfo';
import { OsuBeatmap } from 'osu-db-parser';
import { BeatmapSettings } from '../../../../editor/src/beatmap/BeatmapSettings.ts';
import { StableEditorContext } from './StableEditorContext.ts';

export class StableBeatmapStore extends BeatmapStore {
  async load() {
    if (!window.api.stableDetected) {
      console.warn('Stable not detected, skipping beatmap load');
      return;
    }

    const beatmaps = await window.api.loadBeatmaps() ?? [];

    console.log(`Found ${beatmaps.length} beatmaps`);

    this.beatmaps.value = beatmaps.map(osuBeatmap => new StableBeatmapInfo(osuBeatmap));
  }
}

export class StableBeatmapInfo implements BeatmapItemInfo {
  constructor(osuBeatmap: OsuBeatmap) {
    this.id = osuBeatmap.md5;
    this.setId = osuBeatmap.folder_name;
    this.authorName = osuBeatmap.creator_name;
    this.artist = osuBeatmap.artist_name;
    this.title = osuBeatmap.song_title;
    this.difficultyName = osuBeatmap.difficulty;
    this.starRating = osuBeatmap.star_rating_standard[0] ?? 0;
    this.folderName = osuBeatmap.folder_name;
    this.osuFileName = osuBeatmap.osu_file_name;
    this.audioUrl = this.#relativePath(osuBeatmap.audio_file_name);

    this.previewPoint = osuBeatmap.preview_offset;
  }

  readonly id: string;

  readonly setId: string;

  readonly authorName: string;

  readonly title: string;

  readonly difficultyName: string;

  readonly author = null;

  readonly artist: string;

  readonly starRating: number;

  readonly audioUrl: string;

  readonly lastEdited: Date | null = null;

  readonly previewPoint: number;

  #relativePath(path: string) {
    return `osu-stable://songs?path=${encodeURIComponent(this.folderName + '/' + path)}`;
  }

  async backgroundPath() {
    const filename = await this.settings.then(it => it?.backgroundFilename);
    if (filename)
      return this.#relativePath(filename)

    return null;
  }

  async loadThumbnailSmall() {
    const filename = await this.settings.then(it => it?.backgroundFilename);
    if (filename)
      return loadTexture(this.#relativePath(filename));

    return null;
  }

  async loadThumbnailLarge() {
    const filename = await this.settings.then(it => it?.backgroundFilename);

    if (filename)
      return loadTexture(this.#relativePath(filename), undefined, {
        resize: {
          width: 720,
          height: 200,
          mode: 'fill',
        },
      });

    return null;
  }

  folderName: string;

  osuFileName: string;

  #parsedSettings?: Promise<BeatmapSettings | null>;

  protected get settings(): Promise<BeatmapSettings | null> {
    this.#parsedSettings ??= fetch(`osu-stable://songs/${this.folderName}/${this.osuFileName}`)
      .then(r => r.text())
      .then(text => new StableBeatmapParser().parse(text, { hitObjects: false, timingPoints: false }))
      .then(beatmap => beatmap.settings)
      .catch(() => null);

    return this.#parsedSettings;
  }

  createEditorContext(): EditorContext {
    return new StableEditorContext(this);
  }
}
