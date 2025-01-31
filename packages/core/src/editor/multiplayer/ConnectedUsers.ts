import type { IVec2 } from '@osucad/framework';
import type { ClientInfo, UserPresence } from '@osucad/multiplayer';
import type { OsucadMultiplayerClient } from './OsucadMultiplayerClient';
import { Action, Bindable } from '@osucad/framework';

export class ConnectedUsers {
  #users = new Map<number, ConnectedUser>();

  constructor(readonly client: OsucadMultiplayerClient) {
  }

  readonly userJoined = new Action<ConnectedUser>();

  readonly userLeft = new Action<ConnectedUser>();

  get users() {
    return [...this.#users.values()];
  }

  onUserJoined(client: ClientInfo) {
    if (this.#users.has(client.clientId))
      return;

    const user = new ConnectedUser(client);

    this.#users.set(client.clientId, user);
    this.userJoined.emit(user);
  }

  onUserLeft(client: ClientInfo) {
    const user = this.#users.get(client.clientId);
    if (user) {
      this.#users.delete(client.clientId);
      this.userLeft.emit(user);
    }
  }

  updatePresence<Key extends keyof UserPresence>(key: Key, value: UserPresence[Key]) {
    // TODO
    // this.client.socket.emit('updatePresence', key, value);
  }
}

export class ConnectedUser {
  constructor(readonly clientInfo: ClientInfo) {
    // this.presence = clientInfo.presence;
    this.presence = {
      clock: {
        currentTime: 0,
        isRunning: false,
        rate: 1,
      },
      cursor: null,
    };
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
