import type { AudioChannel, AudioManager, IResourceStore, Track } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { DifficultyInfo } from '../editor/EditorBeatmap';
import type { IResourcesProvider } from '../io/IResourcesProvider';
import type { IBeatmap } from './IBeatmap';
import { Bindable, loadTexture } from 'osucad-framework';
import { BeatmapTransformer } from './BeatmapTransformer';

export abstract class LoadedBeatmap extends BeatmapTransformer implements IBeatmap {
  protected constructor() {
    super();
  }

  beatmap!: IBeatmap;

  protected abstract loadSourceBeatmap(): Promise<IBeatmap>;

  async load(resources: IResourcesProvider) {
    this.beatmap = await this.loadSourceBeatmap();

    await Promise.all([
      this.loadBackground(),
      this.loadSong(resources.audioManager, resources.mixer.music),
    ]);
  }

  protected async loadBackground() {
    if (this.settings.backgroundFilename) {
      const data = this.getResource(this.settings.backgroundFilename);
      if (data)
        this.backgroundTexture.value = await loadTexture(data);
    }
  }

  protected async loadSong(audioManager: AudioManager, channel: AudioChannel) {
    const data = this.getResource(this.settings.audioFileName);

    if (!data)
      throw new Error(`Audio file not found: "${this.settings.audioFileName}"`);

    this.track.value = await audioManager.createTrackFromArrayBuffer(channel, data);
  }

  abstract readonly resources: IResourceStore<ArrayBuffer>;

  getResource(name: string): ArrayBuffer | null {
    return this.resources.get(name);
  }

  readonly backgroundTexture = new Bindable<Texture | null>(null);

  readonly track = new Bindable<Track>(null as unknown as Track);

  save?(): Promise<boolean>;

  async getDifficulties(): Promise<DifficultyInfo[]> {
    return [
      {
        difficultyName: this.beatmap.metadata.difficultyName,
        load: async () => this.beatmap,
      },
      ...await this.getOtherDifficulties(),
    ];
  }

  async getOtherDifficulties(): Promise<DifficultyInfo[]> {
    return [];
  }
}
