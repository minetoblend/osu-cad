import {
  AudioChannel,
  AudioManager,
  Bindable,
  DependencyContainer,
  IResourceStore,
  PIXITexture,
  Track,
} from 'osucad-framework';
import { Beatmap } from '../../beatmap/Beatmap';
import { HitObjectList } from '../../beatmap/hitObjects/HitObjectList';
import { ControlPointInfo } from '../../beatmap/timing/ControlPointInfo';
import { CommandManager } from './CommandManager';
import { IResourcesProvider } from '../../io/IResourcesProvider.ts';

export abstract class EditorContext {

  constructor(
    readonly resourcesProvider: IResourcesProvider,
  ) {
  }

  // #region Beatmap
  protected abstract loadBeatmap(): Promise<Beatmap>;

  get beatmap(): Beatmap {
    if (!this.#beatmap) {
      throw new Error('Beatmap not loaded');
    }
    return this.#beatmap;
  }

  #beatmap: Beatmap | null = null;
  // #endregion

  // #region CommandHandler
  protected createCommandHandler(beatmap: Beatmap): CommandManager {
    return new CommandManager(this, beatmap);
  }

  get commandHandler(): CommandManager {
    if (!this.#commandHandler) {
      throw new Error('Command handler not created');
    }
    return this.#commandHandler;
  }

  #commandHandler: CommandManager | null = null;
  // #endregion

  // #region Song
  abstract resources: IResourceStore<ArrayBuffer>;

  getResource(name: string): ArrayBuffer | null {
    return this.resources.get(name);
  }

  protected async loadSong(beatmap: Beatmap): Promise<Track> {
    console.log('loading song');
    const data = this.getResource(beatmap.settings.audioFileName);

    if (!data) {
      throw new Error(`Audio file not found: "${beatmap.settings.audioFileName}"`);
    }

    const context = new AudioContext();

    const copy = new ArrayBuffer(data.byteLength);
    new Uint8Array(copy).set(new Uint8Array(data));

    const audioBuffer = await context.decodeAudioData(copy);

    console.log('loaded song audio buffer');

    return this.resourcesProvider.audioManager.createTrack(this.resourcesProvider.mixer.music, audioBuffer);
  }

  get song(): Track {
    if (!this.songBindable.value) {
      throw new Error('Song not loaded');
    }

    return this.songBindable.value!;
  }

  readonly songBindable = new Bindable<Track | null>(null);

  // #endregion

  // #region Background
  protected abstract loadBackground(
    beatmap: Beatmap,
  ): Promise<PIXITexture | null>;

  get background(): PIXITexture {
    if (!this.backgroundBindable.value) {
      throw new Error('Background not loaded');
    }

    return this.backgroundBindable.value!;
  }

  readonly backgroundBindable = new Bindable<PIXITexture | null>(null);

  // #endregion

  // #region initialization
  #loaders: (() => Promise<any>)[] = [];

  protected addParallelLoad(loader: () => Promise<any>) {
    this.#loaders.push(loader);
  }

  async load() {
    const beatmap = (this.#beatmap = await this.loadBeatmap());

    this.#commandHandler = this.createCommandHandler(beatmap);

    this.addParallelLoad(
      async () => (this.songBindable.value = await this.loadSong(beatmap)),
    );
    this.addParallelLoad(
      async () => this.backgroundBindable.value = await this.loadBackground(beatmap),
    );

    await Promise.all(this.#loaders.map(loader => loader()));

    this.#loaded = true;
  }

  #loaded = false;

  get loaded() {
    return this.#loaded;
  }

  // #endregion

  provideDependencies(dependencies: DependencyContainer) {
    dependencies.provide(EditorContext, this);
    dependencies.provide(Beatmap, this.beatmap);
    dependencies.provide(HitObjectList, this.beatmap.hitObjects);
    dependencies.provide(ControlPointInfo, this.beatmap.controlPoints);
    dependencies.provide(CommandManager, this.commandHandler);
  }

  dispose() {
    this.#commandHandler?.dispose();
  }

  save?(): Promise<boolean>;
}
