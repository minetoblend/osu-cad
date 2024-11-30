import type { ClientInfo, ClientMessages, ServerMessages } from '@osucad/multiplayer';
import type { Socket } from 'socket.io';

export class RoomUser {
  constructor(
    readonly clientId: number,
    readonly socket: Socket<ClientMessages, ServerMessages>,
  ) {
  }

  presence: any = {};

  getInfo(): ClientInfo {
    return {
      clientId: this.clientId,
      presence: this.presence,
    };
  }
}
