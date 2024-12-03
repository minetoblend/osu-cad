import type { ClientInfo, ClientMessages, ServerMessages } from '@osucad/multiplayer';
import type { Socket } from 'socket.io';

export class RoomUser {
  constructor(
    readonly clientId: number,
    readonly socket: Socket<ClientMessages, ServerMessages>,
  ) {
  }

  userId = 6411631;
  username = 'Maarvin';
  avatarUrl = '';

  presence: any = {};

  getInfo(): ClientInfo {
    return {
      userId: this.userId,
      clientId: this.clientId,
      presence: this.presence,
      username: this.username,
      avatarUrl: this.avatarUrl,
    };
  }
}
