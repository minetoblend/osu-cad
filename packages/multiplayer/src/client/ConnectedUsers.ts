import type { IVec2 } from 'osucad-framework';
import type { ClientInfo } from '../protocol';
import type { ClientSocket } from './ClientSocket';
import { Action, Bindable } from 'osucad-framework';

export class ConnectedUsers {
  #users = new Map<number, ConnectedUser>();

  constructor(socket: ClientSocket) {
    socket.once('initialData', ({ connectedUsers }) =>
      connectedUsers.forEach(it => this.#onUserJoined(it)));
    socket.on('userJoined', client => this.#onUserJoined(client));
    socket.on('userLeft', client => this.#onUserLeft(client));
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
