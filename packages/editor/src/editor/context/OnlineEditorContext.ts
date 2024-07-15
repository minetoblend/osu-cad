/* eslint-disable unused-imports/no-unused-vars */
import type { Beatmap } from '@osucad/common';
import type { DependencyContainer, PIXITexture } from 'osucad-framework';
import { Assets } from 'pixi.js';
import { Skin } from '../../skins/Skin';
import { ConnectedUsersManager } from './ConnectedUsersManager';
import { EditorContext } from './EditorContext';
import type { EditorSocket } from './EditorSocket';
import { OnlineBeatmapLoader } from './OnlineBeatmapLoader';
import type { CommandManager } from './CommandManager';
import { OnlineCommandManager } from './OnlineCommandManager';
import type { BeatmapAsset } from './BeatmapAsset';

export class OnlineEditorContext extends EditorContext {
  readonly socket: EditorSocket;

  constructor(socket: EditorSocket) {
    super();
    this.socket = socket;
  }

  readonly users = new ConnectedUsersManager();

  async load() {
    this.addParallelLoad(() => this.users.init(this.socket));

    await super.load();
  }

  getAssetPath(filename: string) {
    return `/api/mapsets/${this.beatmap.setId}/files/${filename}`;
  }

  loadBeatmap(): Promise<Beatmap> {
    return OnlineBeatmapLoader.loadBeatmap(this.socket);
  }

  async loadSong(beatmap: Beatmap): Promise<AudioBuffer> {
    const context = new AudioContext();

    return fetch(this.getAssetPath(beatmap.audioFilename))
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer));
  }

  async loadBackground(beatmap: Beatmap): Promise<PIXITexture | null> {
    if (beatmap.backgroundPath) {
      try {
        return await Assets.load(this.getAssetPath(beatmap.backgroundPath));
      }
      catch (e) {
        // TODO: Sentry.captureException(e);
        console.error(e);
      }
    }
    return null;
  }

  updateSong(
    file: File,
    onProgress?: ((progress: number) => void) | undefined,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  updateBackground(
    file: File,
    onProgress?: ((progress: number) => void) | undefined,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  protected async loadSkin(): Promise<Skin> {
    const skin = new Skin();

    await skin.load();

    return skin;
  }

  protected createCommandHandler(beatmap: Beatmap): CommandManager {
    return new OnlineCommandManager(this, beatmap, this.users, this.socket);
  }

  provideDependencies(dependencies: DependencyContainer) {
    super.provideDependencies(dependencies);
    dependencies.provide(this.users);
  }

  protected async getBeatmapAssets(): Promise<BeatmapAsset[]> {
    const assets = await fetch(`/api/mapsets/${this.beatmap.setId}/files`).then(
      res => res.json(),
    );

    if (!Array.isArray(assets)) {
      return [];
    }

    return assets;
  }
}
