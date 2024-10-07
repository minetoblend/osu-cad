import type { IBeatmap } from '../beatmap/IBeatmap.ts';
import type { LoadedBeatmap } from '../beatmap/LoadedBeatmap.ts';
import type { BeatmapItemInfo } from '../beatmapSelect/BeatmapItemInfo.ts';
import type { IResourcesProvider } from '../io/IResourcesProvider.ts';
import { BeatmapTransformer } from '../beatmap/BeatmapTransformer.ts';
import { CommandManager } from './context/CommandManager.ts';

export class EditorBeatmap extends BeatmapTransformer<LoadedBeatmap> implements IBeatmap {
  constructor(readonly beatmapInfo: BeatmapItemInfo) {
    super();
  }

  async load(resources: IResourcesProvider) {
    this.beatmap = await this.beatmapInfo.load(resources);

    this.commandManager = this.createCommandManager();
  }

  beatmap!: LoadedBeatmap;

  commandManager!: CommandManager;

  protected createCommandManager() {
    return new CommandManager(this);
  }

  async getDifficulties(): Promise<DifficultyInfo[]> {
    return this.beatmap.getDifficulties();
  }

  async getOtherDifficulties(): Promise<DifficultyInfo[]> {
    return this.beatmap.getOtherDifficulties();
  }
}

export interface DifficultyInfo {
  difficultyName: string;
  load(): Promise<IBeatmap>;
}
