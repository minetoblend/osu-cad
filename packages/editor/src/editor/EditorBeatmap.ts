import type { IBeatmap, IResourcesProvider } from '@osucad/common';
import type { LoadedBeatmap } from '../beatmap/LoadedBeatmap';
import type { BeatmapItemInfo } from '../beatmapSelect/BeatmapItemInfo';
import { BeatmapTransformer } from '../beatmap/BeatmapTransformer';
import { CommandManager } from './context/CommandManager';

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
