import { ClientMessages } from '@osucad/common';
import { RoomUser } from '../room-user';
import { EditorRoom } from '../editor-room';
import { Logger } from '@nestjs/common';

export abstract class MessageHandler {
  readonly handlers: Record<string, string>;

  constructor(protected readonly room: EditorRoom) {}

  get users() {
    return this.room.users;
  }

  onUserJoin(roomUser: RoomUser) {
    const handlers = Object.getPrototypeOf(this).handlers;
    for (const [event, handler] of Object.entries(handlers)) {
      roomUser.socket.on(
        event as Exclude<keyof ClientMessages, number | symbol>,
        (...args: any[]) => this[handler as any](roomUser, ...args),
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterUserJoin(roomUser: RoomUser) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onUserLeave(roomUser: RoomUser) {}

  protected readonly logger = new Logger(this.constructor.name);
}
