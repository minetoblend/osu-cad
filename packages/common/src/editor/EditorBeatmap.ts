import type { IResourceStore, ReadonlyDependencyContainer, Track } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { Beatmap } from '../beatmap/Beatmap';
import type { BeatmapColors } from '../beatmap/BeatmapColors';
import type { BeatmapDifficultyInfo } from '../beatmap/BeatmapDifficultyInfo';
import type { BeatmapMetadata } from '../beatmap/BeatmapMetadata';
import type { BeatmapSettings } from '../beatmap/BeatmapSettings';
import type { HitObjectList } from '../beatmap/HitObjectList';
import type { IBeatmap } from '../beatmap/IBeatmap';
import type { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import { AudioManager, Bindable, Component, loadTexture, resolved } from 'osucad-framework';
import { AudioMixer } from '../audio/AudioMixer';
import { UpdateHandler } from '../crdt/UpdateHandler';
import { CommandManager } from './CommandManager';

export class EditorBeatmap extends Component implements IBeatmap {
  readonly track = new Bindable<Track>(null!);

  readonly backgroundTexture = new Bindable<Texture | null>(null);

  updateHandler!: UpdateHandler;

  constructor(
    readonly beatmap: Beatmap,
    readonly resourceStore: IResourceStore<ArrayBuffer>,
  ) {
    super();
    this.commandManager = this.createCommandManager();
  }

  protected override get hasAsyncLoader(): boolean {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

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
    const data = await this.resourceStore.getAsync(path);
    if (!data)
      throw new Error(`Could not find asset "${path}" for beatmap track`);

    this.track.value = await this.audioManager.createTrackFromArrayBuffer(this.mixer.music, data);
  }

  protected async loadBackground() {
    const path = this.beatmap.settings.backgroundFilename;
    if (!path)
      return;
    const asset = await this.resourceStore.getAsync(path);
    if (!asset)
      return;

    this.backgroundTexture.value = await loadTexture(asset);
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
}
