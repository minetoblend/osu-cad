import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import OsuDBParser from 'osu-db-parser';
import { BeatmapStore } from '../environment/BeatmapStore';
import type { BeatmapItemInfo } from '../beatmapSelect/BeatmapItemInfo';
import { StableBeatmapInfo } from './StableBeatmapInfo';
import BeatmapDecoderWorker from './ElectronBeatmapParseWorker?worker';
import type { ParsedBeatmapInfo } from './ParsedBeatmapInfo';
import type { StablePaths } from './StablePaths';

export class ElectronBeatmapStore extends BeatmapStore {
  constructor(
    readonly paths: StablePaths,
  ) {
    super();

    this.#worker.onmessage = (event) => {
      const { id, beatmap, error } = event.data;
      const callback = this.#parseCallbacks.get(id);

      if (callback) {
        if (error) {
          callback.reject(error);
        }
        else {
          callback.resolve(beatmap);
        }

        this.#parseCallbacks.delete(id);
      }
    };
  }

  async loadBeatmaps(): Promise<BeatmapItemInfo[]> {
    const osuDBPath = this.paths.osuDBPath;
    if (osuDBPath === null) {
      return [];
    }

    const buffer = await readFile(osuDBPath);
    const osuDB = new OsuDBParser(buffer);

    const data = osuDB.getOsuDBData();

    const beatmaps = (data.beatmaps as import('osu-db-parser').Beatmap[]).map(b =>
      new StableBeatmapInfo(this, b, resolve(this.paths.songsPath!, b.folder_name, b.osu_file_name)),
    );
    beatmaps.sort((a, b) => a.title.localeCompare(b.title));

    return beatmaps;
  }

  #worker = new BeatmapDecoderWorker();

  #parseId = 0;

  #parseCallbacks = new Map<number, { resolve: (beatmap: ParsedBeatmapInfo) => void; reject: (e: any) => void }>();

  async loadBeatmap(beatmap: StableBeatmapInfo): Promise<ParsedBeatmapInfo> {
    const contents = await readFile(beatmap.filePath, 'utf-8');

    return new Promise<ParsedBeatmapInfo>((resolve, reject) => {
      try {
        const id = this.#parseId++;

        this.#parseCallbacks.set(id, { resolve, reject });
        this.#worker.postMessage({ id, contents });
      }
      catch (e: any) {
        reject(e);
      }
    });
  }
}
