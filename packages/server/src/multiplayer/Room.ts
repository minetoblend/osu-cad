import type { Beatmap } from '@osucad/core';
import type { AssetInfo, ClientMessages, MutationContext, ServerMessages, SignalKey, SubmitMutationsMessage, UserPresence } from '@osucad/multiplayer';
import type { BroadcastOperator, Socket } from 'socket.io';
import { MutationSource, UpdateHandler } from '@osucad/multiplayer';
import { Json } from '@osucad/serialization';
import { nextClientId } from './clientId';
import { RoomUser } from './RoomUser';

export class Room {
  constructor(
    private readonly id: string,
    private readonly broadcast: BroadcastOperator<ServerMessages, ClientMessages>,
    private readonly beatmap: Beatmap<any>,
    private readonly assets: AssetInfo[],
  ) {
    this.updateHandler = new UpdateHandler(beatmap);
    this.updateHandler.attach(beatmap);
  }

  private readonly updateHandler: UpdateHandler;

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
      beatmap: {
        ruleset: this.beatmap.beatmapInfo.ruleset.shortName,
        data: this.beatmap.createSummary(),
      },
      assets: this.assets,
      connectedUsers: [...this.users.values()].map(it => it.getInfo()),
    });

    this.users.set(clientId, user);

    this.broadcast.emit('userJoined', user.getInfo());

    socket.on('disconnect', () => this.handleDisconnect(user));

    socket.on('createChatMessage', message => this.handleChat(user, message));
    socket.on('submitSignal', (key, data) => this.handleSignal(user, key, data));
    socket.on('submitMutations', message => this.handleSubmitMutations(user, message));
    socket.on('updatePresence', (key, data) => this.handlePresence(user, key, data));
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

  private handleSignal(user: RoomUser, key: SignalKey, data: any) {
    this.broadcast.emit('signal', user.clientId, key, data);
  }

  private handlePresence<Key extends keyof UserPresence>(user: RoomUser, key: Key, data: UserPresence[Key]) {
    user.presence[key] = data;
    this.broadcast.emit('presenceUpdated', user.clientId, key, data);
  }

  private handleSubmitMutations(user: RoomUser, message: SubmitMutationsMessage) {
    const ctx: MutationContext = {
      // pretending that all mutations are local on server side so it doesn't try to do any conflict resolution
      source: MutationSource.Local,
      version: message.version,
    };

    for (const mutation of message.mutations)
      this.updateHandler.apply(mutation, ctx);

    this.broadcast.emit('mutationsSubmitted', {
      version: message.version,
      clientId: user.clientId,
      mutations: message.mutations,
    });
  }
}
