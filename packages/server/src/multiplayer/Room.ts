import type { IBeatmap } from '@osucad/common';
import type { AssetInfo, ClientMessages, ServerMessages } from '@osucad/multiplayer';
import type { BroadcastOperator, Socket } from 'socket.io';
import { Beatmap } from '@osucad/common';
import { Json } from '@osucad/serialization';
import { nextClientId } from './clientId';
import { RoomUser } from './RoomUser';

export class Room {
  constructor(
    private readonly id: string,
    private readonly broadcast: BroadcastOperator<ServerMessages, ClientMessages>,
    private readonly beatmap: IBeatmap,
    private readonly assets: AssetInfo[],
  ) {
  }

  private readonly json = new Json();

  private readonly users = new Map<number, RoomUser>();

  accept(socket: Socket<ClientMessages, ServerMessages>) {
    const clientId = nextClientId();

    socket.join(this.id);

    const user = new RoomUser(
      clientId,
      socket,
    );

    socket.emit('initialData', {
      clientId,
      beatmapData: this.json.encode(Beatmap.serializer, this.beatmap),
      assets: this.assets,
      connectedUsers: [...this.users.values()].map(it => it.getInfo()),
    });

    this.users.set(clientId, user);

    this.broadcast.emit('userJoined', user.getInfo());

    socket.on('disconnect', () => this.handleDisconnect(user));

    socket.on('createChatMessage', message => this.handleChat(user, message));
  }

  private handleDisconnect(user: RoomUser) {
    if (this.users.delete(user.clientId)) {
      this.broadcast.emit('userLeft', user.getInfo());
    }
  }

  private handleChat(user: RoomUser, content: string) {
    this.broadcast.emit('chatMessageCreated', {
      content,
      timestamp: Date.now(),
      user: user.getInfo(),
    });
  }
}
