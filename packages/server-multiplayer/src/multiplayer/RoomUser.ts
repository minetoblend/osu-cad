import type { ClientInfo, ClientMessages, ServerMessages, UserPresence } from '@osucad/multiplayer';
import type { Socket } from 'socket.io';

export class RoomUser {
  constructor(
    readonly clientId: number,
    readonly socket: Socket<ClientMessages, ServerMessages>,
    readonly color: number,
  ) {
  }

  userId = 6411631;
  username = 'Maarvin';
  avatarUrl = '';

  presence: UserPresence = {
    clock: {
      currentTime: 0,
      isRunning: false,
      rate: 1,
    },
    cursor: null,
  };

  getInfo(): ClientInfo {
    return {
      userId: this.userId,
      clientId: this.clientId,
      presence: this.presence,
      username: this.username,
      avatarUrl: this.avatarUrl,
      color: this.color,
    };
  }
}
