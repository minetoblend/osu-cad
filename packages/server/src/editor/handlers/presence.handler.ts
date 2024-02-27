import { MessageHandler } from './message-handler';
import { Decorator } from './decorator';
import { RoomUser } from '../room-user';
import { Presence } from '@osucad/common';

export class PresenceHandler extends MessageHandler {
  @Decorator('setPresence')
  onSetPresence(roomUser: RoomUser, presence: Presence): void {
    roomUser.presence = presence;
    this.room.broadcast('userActivity', roomUser.sessionId, presence.activity);
  }
}
