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

class StableBeatmapInfo implements BeatmapItemInfo {
  constructor(readonly osuBeatmap: OsuBeatmap) {
  }

  get id() {
    return this.osuBeatmap.md5;
  }

  get setId() {
    return this.osuBeatmap.folder_name;
  }

  get authorName() {
    return this.osuBeatmap.creator_name;
  }

  author = null;

  get artist() {
    return this.osuBeatmap.artist_name;
  }

  get title() {
    return this.osuBeatmap.song_title;
  }

  get difficultyName() {
    return this.osuBeatmap.difficulty;
  }

  get starRating() {
    return this.osuBeatmap.star_rating_standard[0] ?? 0;
  }

  get audioUrl() {
    return this.#relativePath(this.osuBeatmap.audio_file_name);
  }

  get lastEdited() {
    if (!this.osuBeatmap.last_modification_time || this.osuBeatmap.last_modification_time < 0)
      return null;

    // TDOO: Fix this
    // return new Date(this.osuBeatmap.last_modification_time / 1e+4 + new Date('0001-01-01T00:00:00Z').getTime());

    return null
  }

  get previewPoint() {
    return this.osuBeatmap.preview_offset;
  }

  #relativePath(path: string) {
    return `osu-stable://songs?path=${encodeURIComponent(this.osuBeatmap.folder_name + '/' + path)}`;
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

  #parsedSettings?: Promise<BeatmapSettings | null>;

  protected get settings(): Promise<BeatmapSettings | null> {
    this.#parsedSettings ??= fetch(`osu-stable://songs/${this.osuBeatmap.folder_name}/${this.osuBeatmap.osu_file_name}`)
      .then(r => r.text())
      .then(text => new StableBeatmapParser().parse(text, { hitObjects: false, timingPoints: false }))
      .then(beatmap => beatmap.settings)
      .catch(() => null);

    return this.#parsedSettings;
  }

  createEditorContext(): EditorContext {
    return new StableEditorContext(this.osuBeatmap);
  }
}
