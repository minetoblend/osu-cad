import { ElectronAPI } from '@electron-toolkit/preload';
import { OsuBeatmap } from 'osu-db-parser';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: ExposedAPI;
  }

  interface ExposedAPI {
    get stableDetected(): boolean;

    osuPaths: {
      installPath: string;
      songsPath: string | null;
      skinsPath: string | null;
      dbPath: string | null;
    } | null;

    loadBeatmaps(): Promise<(OsuBeatmap[]) | null>;

    loadSkins(): Promise<ElectronSkinInfo[]>;

    saveBeatmap(
      directory: string,
      filename: string,
      content: string,
    ): Promise<boolean>;

    checkForUpdates(): void;

    onUpdateAvailable(fn: () => void): () => void;

    onUpdateDownloadProgress(fn: (percent: number) => void): () => void;

    onUpdateDownloadComplete(fn: () => void): () => void;

    installUpdate()
  }

  interface ElectronSkinInfo {
    name: string;
    path: string;
  }
}
