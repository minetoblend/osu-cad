import type { UserInfo } from '@osucad/common';
import { loadTexture } from 'osucad-framework';
import type { BeatmapItemInfo } from '../../beatmapSelect/BeatmapItemInfo';
import type { EditorContext } from '../../editor/context/EditorContext';
import { ElectronEditorContext } from '../../editor/context/ElectronEditorContext';
import type { ElectronBeatmapStore } from './ElectronBeatmapStore';
import type { ParsedBeatmapInfo } from './ParsedBeatmapInfo';

// eslint-disable-next-line ts/no-require-imports
const { resolve } = require('node:path');
// eslint-disable-next-line ts/no-require-imports
const { readFile } = require('node:fs/promises');

export class StableBeatmapInfo implements BeatmapItemInfo {
  constructor(
    readonly store: ElectronBeatmapStore,
    options: import('osu-db-parser').Beatmap,
    readonly filePath: string,
  ) {
    this.id = options.beatmap_id > 0
      ? options.beatmap_id.toString()
      : options.md5;
    this.setId
      = options.folder_name;
    this.authorName = options.creator_name;
    this.artist = options.artist_name;
    this.title = options.song_title;
    this.difficultyName = options.difficulty;
    this.starRating = options.star_rating_standard[0] ?? 0;
    this.lastEdited = null;
    this.previewPoint = options.preview_offset;
    this.audioUrl = resolve(this.filePath, '..', options.audio_file_name);
  }

  id: string;
  setId: string;
  author: UserInfo | null = null;
  authorName: string;
  artist: string;
  title: string;
  difficultyName: string;
  starRating: number;
  lastEdited: Date | null;
  previewPoint: number | null;

  #initialized = false;

  audioUrl: string;

  #thumbnailSmall: string | null = null;

  #thumbnailLarge: string | null = null;

  #parsedBeatmapPromise: Promise<ParsedBeatmapInfo> | null = null;

  get #parsedBeatmap() {
    if (this.#parsedBeatmapPromise === null) {
      this.#parsedBeatmapPromise = (async () => this.store.loadBeatmap(this))();
    }

    return this.#parsedBeatmapPromise!;
  }

  createEditorContext(): EditorContext {
    return new ElectronEditorContext(this.filePath);
  }

  async loadThumbnailLarge() {
    return this.#parsedBeatmap
      .then(it => loadTexture(resolve(this.filePath, '..', it.backgroundPath)))
      .catch(() => null);
  }

  async loadThumbnailSmall() {
    return null;
  }
}
