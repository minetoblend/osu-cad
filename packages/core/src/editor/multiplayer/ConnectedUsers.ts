import type { IVec2 } from '@osucad/framework';
import type { ClientInfo, UserPresence } from '@osucad/multiplayer';
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

    socket.on('presenceUpdated', (clientId, key, data) => {
      if (clientId === this.client.clientId)
        return;

      const user = this.#users.get(clientId);
      if (!user)
        return;

      user.presence[key] = data;
      user.presenceUpdated.emit(key);
    });
  }

  readonly userJoined = new Action<ConnectedUser>();

  readonly userLeft = new Action<ConnectedUser>();

  get users() {
    return [...this.#users.values()];
  }

  #onUserJoined(client: ClientInfo) {
    if (this.#users.has(client.clientId))
      return;

    const user = new ConnectedUser(client);

    this.#users.set(client.clientId, user);
    this.userJoined.emit(user);
  }

  #onUserLeft(client: ClientInfo) {
    const user = this.#users.get(client.clientId);
    if (user) {
      this.#users.delete(client.clientId);
      this.userLeft.emit(user);
    }
  }

  #ownCursor: CursorPosition | null = null;

  setOwnCursor(cursor: CursorPosition | null) {
    this.#ownCursor = cursor;
    this.client.socket.emit('submitSignal', SignalKey.Cursor, cursor);
  }

  get ownCursor() {
    return this.#ownCursor;
  }

  updatePresence<Key extends keyof UserPresence>(key: Key, value: UserPresence[Key]) {
    this.client.socket.emit('updatePresence', key, value);
  }
}

export class ConnectedUser {
  constructor(readonly clientInfo: ClientInfo) {
    this.presence = clientInfo.presence;
  }

  readonly cursorPosition = new Bindable<CursorPosition | null>(null);

  get clientId() {
    return this.clientInfo.clientId;
  }

  readonly presence: UserPresence;

  readonly presenceUpdated = new Action<string>();

  get clock() {
    return this.presence.clock;
  }
}

export interface CursorPosition {
  screen: string;
  position: IVec2;
  pressed: boolean;
}
