import type {
  BeatmapColors,
  BeatmapDifficultyInfo,
  BeatmapMetadata,
  BeatmapSettings,
  ControlPointInfo,
  HitObjectList,
  IBeatmap,
} from '@osucad/common';
import type {
  Track,
} from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { BeatmapAssetManager } from './BeatmapAssetManager';
import {
  AudioMixer,
} from '@osucad/common';
import { CommandManager } from '@osucad/editor/editor/context/CommandManager';
import {
  asyncDependencyLoader,
  AudioManager,
  Bindable,
  Component,
  loadTexture,
  resolved,
} from 'osucad-framework';

export abstract class EditorBeatmap extends Component implements IBeatmap {
  abstract readonly beatmap: IBeatmap;

  abstract readonly assets: BeatmapAssetManager;

  readonly track = new Bindable<Track>(null!);

  readonly backgroundTexture = new Bindable<Texture | null>(null);

  protected constructor() {
    super();
    this.commandManager = this.createCommandManager();
  }

  @asyncDependencyLoader()
  async [Symbol('load')]() {
    await Promise.all([
      this.loadTrack(),
      this.loadBackground(),
    ]);
  }

  @resolved(AudioManager)
  protected audioManager!: AudioManager;

  @resolved(AudioMixer)
  protected mixer!: AudioMixer;

  protected async loadTrack() {
    const path = this.beatmap.settings.audioFileName;
    const asset = this.assets.getAsset(path);
    if (!asset)
      throw new Error(`Could not find asset "${path}" for beatmap track`);

    this.track.value = await this.audioManager.createTrackFromArrayBuffer(this.mixer.music, asset.data);
  }

  protected async loadBackground() {
    const path = this.beatmap.settings.backgroundFilename;
    if (!path)
      return;
    const asset = this.assets.getAsset(path);
    console.log(asset);
    if (!asset)
      return;

    this.backgroundTexture.value = await loadTexture(asset.data);
  }

  commandManager!: CommandManager;

  protected createCommandManager() {
    return new CommandManager(this);
  }

  get settings(): BeatmapSettings {
    return this.beatmap.settings;
  }

  get metadata(): BeatmapMetadata {
    return this.beatmap.metadata;
  }

  get difficulty(): BeatmapDifficultyInfo {
    return this.beatmap.difficulty;
  }

  get colors(): BeatmapColors {
    return this.beatmap.colors;
  }

  get controlPoints(): ControlPointInfo {
    return this.beatmap.controlPoints;
  }

  get hitObjects(): HitObjectList {
    return this.beatmap.hitObjects;
  }

  override dispose() {
    this.assets.dispose();
  }
}
