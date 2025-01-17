import type { IVec2 } from '@osucad/framework';
import type { ClientInfo } from '@osucad/multiplayer';
import type { MultiplayerClient } from './MultiplayerClient';
import { Action, Bindable } from '@osucad/framework';
import { SignalKey } from '@osucad/multiplayer';

export class ConnectedUsers {
  #users = new Map<number, ConnectedUser>();

  constructor(readonly client: MultiplayerClient) {
    const { socket } = client;

    socket.once('initialData', ({ connectedUsers }) =>
      connectedUsers.forEach(it => this.#onUserJoined(it)));
    socket.on('userJoined', client => this.#onUserJoined(client));
    socket.on('userLeft', client => this.#onUserLeft(client));

    socket.on('signal', (clientId, key, data) => {
      if (key === SignalKey.Cursor && clientId !== this.client.clientId) {
        const user = this.#users.get(clientId);
        if (user)
          user.cursorPosition.value = data;
      }
    });
  }

  readonly userJoined = new Action<ClientInfo>();

  readonly userLeft = new Action<ClientInfo>();

  get users() {
    return [...this.#users.values()];
  }

  #onUserJoined(client: ClientInfo) {
    if (this.#users.has(client.clientId))
      return;

    this.#users.set(client.clientId, new ConnectedUser(client));
    this.userJoined.emit(client);
  }

  #onUserLeft(client: ClientInfo) {
    if (this.#users.delete(client.clientId)) {
      this.userLeft.emit(client);
    }
  }
}

class ConnectedUser {
  constructor(readonly clientInfo: ClientInfo) {}
  readonly cursorPosition = new Bindable<CursorPosition | null>(null);

  get clientId() {
    return this.clientInfo.clientId;
  }
}

export interface CursorPosition {
  screen: string;
  position: IVec2;
}
