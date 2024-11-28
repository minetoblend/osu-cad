import type { ServerMessages } from '../protocol/ServerMessage';
import type { ClientSocket } from './ClientSocket';
import { BeatmapSerializer } from '@osucad/common';
import { Json } from '@osucad/serialization';
import { MultiplayerAssetManager } from './MultiplayerAssetManager';
import { MultiplayerEditorBeatmap } from './MultiplayerEditorBeatmap';

export class MultiplayerClient {
  constructor(readonly socketFactory: () => ClientSocket) {
  }

  socket!: ClientSocket;

  async load() {
    this.socket = this.socketFactory();

    const { clientId, beatmapData, assets } = await this.#nextMessage('initialData');

    this.#clientId = clientId;

    const beatmap = new Json().decode(new BeatmapSerializer(), beatmapData);
    const assetManager = new MultiplayerAssetManager();
    await assetManager.load(assets);

    this.beatmap = new MultiplayerEditorBeatmap(beatmap, assetManager);
  }

  #clientId: number = -1;

  get clientId() {
    return this.#clientId;
  }

  beatmap!: MultiplayerEditorBeatmap;

  #nextMessage<Ev extends keyof ServerMessages>(messageType: Ev): Promise<Parameters<ServerMessages[Ev]>[0]> {
    let off: () => void;

    return new Promise<Parameters<ServerMessages[Ev]>[0]>((resolve, reject) => {
      off = () => {
        this.socket.off('connect_error', reject);
        this.socket.off(messageType, resolve as any);
      };

      this.socket.once('connect_error', reject);
      this.socket.once(messageType, resolve as any);
    }).finally(() => off());
  }
}
