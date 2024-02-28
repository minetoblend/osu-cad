import { OnMessage } from './decorator';
import { MessageHandler } from './message-handler';
import { BeatmapAccess } from '@osucad/common';
import { RoomUser } from '../room-user';

export class UserHandler extends MessageHandler {
  onUserJoin(roomUser: RoomUser) {
    super.onUserJoin(roomUser);
    roomUser.send('identity', roomUser.getInfo());
    roomUser.send(
      'connectedUsers',
      this.room.users.map((u) => u.getInfo()),
    );
  }

  afterUserJoin(roomUser: RoomUser) {
    this.room.broadcast('userJoined', roomUser.getInfo());
  }

  onUserLeave(roomUser: RoomUser) {
    super.onUserLeave(roomUser);
    this.room.broadcast('userLeft', roomUser.getInfo(), 'disconnected');
  }

  @OnMessage('kickUser')
  onKickUser(
    roomUser: RoomUser,
    kickedUserId: number,
    reason: string,
    isBan: boolean,
  ): void {
    const users = this.users.filter((u) => u.user.id === kickedUserId);
    if (roomUser.access >= BeatmapAccess.MapsetOwner) {
      for (const targetUser of users) {
        targetUser.send('kicked', reason, isBan);
        this.kick(targetUser.sessionId);
      }
    }
  }

  kick(sessionId: number) {
    const user = this.users.find((u) => u.sessionId === sessionId);
    if (user) {
      this.room.broadcast('userLeft', user.getInfo(), 'kicked');
      this.users.splice(this.users.indexOf(user), 1);
      user.socket.disconnect();
    }
  }
}
