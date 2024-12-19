import type { Track } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { Beatmap } from '../beatmap/Beatmap';
import type { BeatmapColors } from '../beatmap/BeatmapColors';
import type { BeatmapDifficultyInfo } from '../beatmap/BeatmapDifficultyInfo';
import type { BeatmapMetadata } from '../beatmap/BeatmapMetadata';
import type { BeatmapSettings } from '../beatmap/BeatmapSettings';
import type { HitObjectList } from '../beatmap/HitObjectList';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import type { BeatmapAssetManager } from './BeatmapAssetManager';
import { asyncDependencyLoader, AudioManager, Bindable, Component, loadTexture, resolved } from 'osucad-framework';
import { AudioMixer } from '../audio/AudioMixer';
import { UpdateHandler } from '../crdt/UpdateHandler';
import { CommandManager } from './CommandManager';

export abstract class EditorBeatmap extends Component implements IBeatmap {
  abstract readonly beatmap: Beatmap;

  abstract readonly assets: BeatmapAssetManager;

  readonly track = new Bindable<Track>(null!);

  readonly backgroundTexture = new Bindable<Texture | null>(null);

  updateHandler!: UpdateHandler;

  protected constructor() {
    super();
    this.commandManager = this.createCommandManager();
  }

  @asyncDependencyLoader()
  async load() {
    this.addInternal(this.updateHandler = new UpdateHandler(this));

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
