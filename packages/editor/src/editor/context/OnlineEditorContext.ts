/* eslint-disable unused-imports/no-unused-vars */
import type { Beatmap } from '@osucad/common';
import type { DependencyContainer, PIXITexture } from 'osucad-framework';
import { Assets } from 'pixi.js';
import { io } from 'socket.io-client';
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

  constructor(readonly joinKey: string) {
    super();
    const hostname = window.origin.replace(/^https/, 'wss');

    this.socket = io(`${hostname}/editor`, {
      withCredentials: true,
      query: { id: joinKey },
      transports: ['websocket'],
      autoConnect: false,
      reconnection: false,
      timeout: 5000,
    });
  }

  readonly users = new ConnectedUsersManager();

  async load() {
    this.addParallelLoad(() => this.users.init(this.socket));

    this.socket.connect();

    return Promise.race([
      super.load(),
      new Promise<void>((_, reject) => {
        this.socket.once('disconnect', () => reject('Disconnected from server'));
      }),
    ]);
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

  dispose() {
    super.dispose();
    try {
      if (this.beatmap.backgroundPath) {
        Assets.unload(this.getAssetPath(this.beatmap.backgroundPath));
      }
      this.socket.disconnect();
    }
    catch (e) {

    }
  }
}
