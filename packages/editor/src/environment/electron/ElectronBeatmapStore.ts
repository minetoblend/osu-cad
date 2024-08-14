import { BeatmapStore } from '../BeatmapStore';
import type { BeatmapItemInfo } from '../../beatmapSelect/BeatmapItemInfo';
import { StableBeatmapInfo } from './StableBeatmapInfo';
import BeatmapDecoderWorker from './ElectronBeatmapParseWorker?worker';
import type { ParsedBeatmapInfo } from './ParsedBeatmapInfo';

// eslint-disable-next-line ts/no-require-imports
const { readFile } = require('node:fs/promises');
// eslint-disable-next-line ts/no-require-imports
const { resolve } = require('node:path');
// eslint-disable-next-line ts/no-require-imports
const OsuDBParser = require('osu-db-parser');
// eslint-disable-next-line ts/no-require-imports
const regedit = require('regedit').promisified;

export class ElectronBeatmapStore extends BeatmapStore {
  constructor() {
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

  async getOsuInstallPath(): Promise<string | null> {
    if (process.platform === 'win32') {
      return this.getOsuInstallPathFromRegistry();
    }

    return null;
  }

  async getOsuInstallPathFromRegistry(): Promise<string | null> {
    const registryKey = 'HKCR\\osu!\\shell\\open\\command';
    const results = await regedit.list(registryKey);
    const result = results[registryKey];
    if (result.exists) {
      return result.values[''].value
        .replace(/"/g, '')
        .split(' ')[0]
        .replace(/osu!.exe/, '');
    }

    return null;
  }

  async getOsuDBPath(): Promise<string | null> {
    const osuInstallPath = await this.getOsuInstallPath();
    if (osuInstallPath === null) {
      return null;
    }

    return resolve(osuInstallPath, 'osu!.db');
  }

  async loadBeatmaps(): Promise<BeatmapItemInfo[]> {
    const osuDBPath = await this.getOsuDBPath();
    if (osuDBPath === null) {
      return [];
    }

    const buffer = await readFile(osuDBPath);
    const osuDB = new OsuDBParser(buffer);

    const data = osuDB.getOsuDBData();

    return data.beatmaps.map((b: import('osu-db-parser').Beatmap) =>
      new StableBeatmapInfo(this, b, resolve(osuDBPath, '../songs', b.folder_name, b.osu_file_name)),
    );
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
