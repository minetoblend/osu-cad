import { UserEntity } from '../users/user.entity';
import { Socket } from 'socket.io';
import {
  BeatmapAccess,
  ClientMessages,
  Presence,
  ServerMessages,
  UserSessionInfo,
} from '@osucad/common';
import { EditorRoom } from './editor-room';
import { CompressedSocket } from './compressed-socket';

export class RoomUser {
  constructor(
    readonly user: UserEntity,
    socket: Socket<ClientMessages, ServerMessages>,
    readonly sessionId: number,
    readonly room: EditorRoom,
    public access: BeatmapAccess,
  ) {
    this.socket = new CompressedSocket(socket);
  }

  socket: CompressedSocket;

  presence: Presence = {
    activity: null,
    activeBeatmap: null,
  };

  getInfo(): UserSessionInfo {
    return {
      ...this.user.getInfo(),
      sessionId: this.sessionId,
      presence: this.presence,
      access: this.access,
    };
  }

  send<T extends keyof ServerMessages>(
    message: T,
    ...parameters: Parameters<ServerMessages[T]>
  ) {
    this.socket.send(message, ...parameters);
  }
  sendRaw<T extends keyof ServerMessages>(message: T, data: Uint8Array) {
    this.socket.sendRaw(message, data);
  }

  get username() {
    return this.user.username;
  }
}
