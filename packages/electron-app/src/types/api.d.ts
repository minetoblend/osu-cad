import { ElectronAPI } from '@electron-toolkit/preload';
import { OsuBeatmap } from 'osu-db-parser';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: ExposedAPI;
  }

  interface ExposedAPI {
    get stableDetected(): boolean;

    loadBeatmaps(): Promise<(OsuBeatmap[]) | null>;

    loadSkins(): Promise<ElectronSkinInfo[]>;
  }

  interface ElectronSkinInfo {
    name: string;
    path: string;
  }
}
