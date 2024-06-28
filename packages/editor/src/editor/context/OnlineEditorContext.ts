import { Beatmap } from '@osucad/common';
import { PIXITexture } from 'osucad-framework';
import { Assets } from 'pixi.js';
import { io } from 'socket.io-client';
import { Skin } from '../../skins/Skin';
import { ConnectedUsersManager } from './ConnectedUsersManager';
import { EditorContext } from './EditorContext';
import { EditorSocket } from './EditorSocket';
import { OnlineBeatmapLoader } from './OnlineBeatmapLoader';

export class OnlineEditorContext extends EditorContext {
  #socket: EditorSocket | null = null;

  get socket() {
    if (!this.#socket) {
      throw new Error('Socket not initialized');
    }
    return this.#socket;
  }

  readonly users = new ConnectedUsersManager();

  async load() {
    this.#socket = io();

    this.addParallelLoad(() => this.users.init(this.socket));

    await super.load();
  }

  loadBeatmap(): Promise<Beatmap> {
    return OnlineBeatmapLoader.loadBeatmap(this.socket);
  }

  async loadSong(beatmap: Beatmap): Promise<AudioBuffer> {
    // TODO: Load song from server
    return new AudioBuffer({ length: 0, sampleRate: 0 });
  }

  async loadBackground(beatmap: Beatmap): Promise<PIXITexture | null> {
    if (beatmap.backgroundPath) {
      try {
        return await Assets.load(
          `/api/mapsets/${beatmap.setId}/files/${beatmap.backgroundPath}`,
        );
      } catch (e) {
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
    return new Skin();
  }
}
