import type { ServerMessages } from '../protocol/ServerMessage';
import type { ClientSocket } from './ClientSocket';
import type { SignalKey } from './SignalKey';
import { BeatmapSerializer } from '@osucad/common';
import { Json } from '@osucad/serialization';
import { Action, Component } from 'osucad-framework';
import { Chat } from './Chat';
import { ConnectedUsers } from './ConnectedUsers';
import { MultiplayerAssetManager } from './MultiplayerAssetManager';
import { MultiplayerEditorBeatmap } from './MultiplayerEditorBeatmap';

export class MultiplayerClient extends Component {
  constructor(readonly socketFactory: () => ClientSocket) {
    super();
  }

  socket!: ClientSocket;

  connectedUsers!: ConnectedUsers;

  chat!: Chat;

  onSignal = new Action<{ clientId: number; key: SignalKey; data: any }>();

  emitSignal(key: SignalKey, data: any) {
    this.socket.emit('submitSignal', key, data);
  }

  async load() {
    this.socket = this.socketFactory();

    this.connectedUsers = new ConnectedUsers(this.socket);
    this.chat = new Chat(this.socket);

    const { clientId, beatmapData, assets } = await this.#nextMessage('initialData');

    this.#clientId = clientId;

    const beatmap = new Json().decode(new BeatmapSerializer(), beatmapData);
    const assetManager = new MultiplayerAssetManager();
    await assetManager.load(assets);

    this.beatmap = new MultiplayerEditorBeatmap(beatmap, assetManager, this);

    this.socket.on('signal', (clientId, key, data) => {
      if (clientId !== this.clientId)
        this.onSignal.emit({ clientId, key, data });
    });
  }

  #clientId: number = -1;

  get clientId() {
    return this.#clientId;
  }

  beatmap!: MultiplayerEditorBeatmap;

  async #nextMessage<Ev extends keyof ServerMessages>(messageType: Ev): Promise<Parameters<ServerMessages[Ev]>[0]> {
    let off: () => void;

    try {
      return await new Promise<Parameters<ServerMessages[Ev]>[0]>((resolve, reject) => {
        off = () => {
          this.socket.off('connect_error', reject);
          this.socket.off(messageType, resolve as any);
        };

        this.socket.once('connect_error', reject);
        this.socket.once(messageType, resolve as any);
      });
    }
    finally {
      off!();
    }
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.socket?.disconnect();
  }
}
