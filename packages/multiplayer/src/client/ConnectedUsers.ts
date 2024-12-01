import type { ClientInfo } from '../protocol';
import type { ClientSocket } from './ClientSocket';
import { Action } from 'osucad-framework';

export class ConnectedUsers {
  #users = new Map<number, ClientInfo>();

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

    this.#users.set(client.clientId, client);
    this.userJoined.emit(client);
  }

  #onUserLeft(client: ClientInfo) {
    if (this.#users.delete(client.clientId)) {
      this.userLeft.emit(client);
    }
  }
}
