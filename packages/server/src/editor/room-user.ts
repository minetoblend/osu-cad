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
    readonly socket: Socket<ClientMessages, ServerMessages>,
    readonly sessionId: number,
    readonly room: EditorRoom,
    public access: BeatmapAccess,
  ) {

  }

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
    this.socket.emit(message, ...parameters);
  }

  get username() {
    return this.user.username;
  }
}
