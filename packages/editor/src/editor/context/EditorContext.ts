import { Beatmap } from '@osucad/common';
import { Bindable, DependencyContainer, PIXITexture } from 'osucad-framework';
import { Skin } from '../../skins/Skin';
import { CommandHandler } from './CommandHandler';

export abstract class EditorContext {
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
  protected createCommandHandler(beatmap: Beatmap): CommandHandler {
    return new CommandHandler(this, beatmap);
  }

  get commandHandler(): CommandHandler {
    if (!this.#commandHandler) {
      throw new Error('Command handler not created');
    }
    return this.#commandHandler;
  }

  #commandHandler: CommandHandler | null = null;
  // #endregion

  // #region Song
  protected abstract loadSong(beatmap: Beatmap): Promise<AudioBuffer>;

  get song(): AudioBuffer {
    if (!this.songBindable.value) {
      throw new Error('Song not loaded');
    }

    return this.songBindable.value!;
  }

  readonly songBindable = new Bindable<AudioBuffer | null>(null);

  abstract updateSong(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<boolean>;

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

  abstract updateBackground(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<boolean>;
  // #endregion

  // #region Skin
  protected abstract loadSkin(): Promise<Skin>;

  get skin(): Skin {
    if (!this.skinBindable.value) {
      throw new Error('Skin not loaded');
    }

    return this.skinBindable.value!;
  }

  readonly skinBindable = new Bindable<Skin | null>(null);
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
      async () => (this.skinBindable.value = await this.loadSkin()),
    );

    this.loadBackground(beatmap).then(
      (background) => (this.backgroundBindable.value = background),
    );

    await Promise.all(this.#loaders.map((loader) => loader()));
  }
  // #endregion

  provideDependencies(dependencies: DependencyContainer) {
    dependencies.provide(EditorContext, this);
    dependencies.provide(Beatmap, this.beatmap);
    dependencies.provide(Skin, this.skin);
    dependencies.provide(CommandHandler, this.commandHandler);
  }
}
