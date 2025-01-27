import type { AssetInfo, ClientMessages, ServerMessages, SignalKey, SubmitMutationsMessage, UserPresence } from '@osucad/multiplayer';
import type { BroadcastOperator, Socket } from 'socket.io';
import type { OrderingService } from '../services/OrderingService';
import { nextClientId } from './clientId';
import { RoomUser } from './RoomUser';

export class Room {
  constructor(
    private readonly id: string,
    private readonly broadcast: BroadcastOperator<ServerMessages, ClientMessages>,
    private readonly orderingService: OrderingService,
    private readonly assets: AssetInfo[],
  ) {
  }

  private readonly users = new Map<number, RoomUser>();

  private readonly colors = [
    0xFF4B60,
    0xFFA14B,
    0xF5DD42,
    0x90F542,
    0x42F5A4,
    0x2FD1ED,
    0x3455F7,
    0xA635FC,
    0xE329AB,
  ];

  async accept(socket: Socket<ClientMessages, ServerMessages>) {
    const clientId = nextClientId();

    socket.join(this.id);

    let color = this.colors[0];
    for (let i = 0; i < this.colors.length; i++) {
      color = this.colors[i];
      if ([...this.users.values()].every(it => it.color !== color))
        break;
    }

    const user = new RoomUser(
      clientId,
      socket,
      color,
    );

    const { summary, ops } = await this.orderingService.getMessagesSinceLastSummary();

    socket.emit('initialData', {
      clientId,
      document: {
        summary: summary.summary,
        ops,
        sequenceNumber: summary.sequenceNumber,
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

  private async handleSubmitMutations(user: RoomUser, message: SubmitMutationsMessage) {
    const { sequencedMessage, mutationCount } = await this.orderingService.appendOps(user.clientId, message);

    this.broadcast.emit('mutationsSubmitted', sequencedMessage);

    if (mutationCount > 1000)
      this.requestSummary().then();
  }

  private isRequestingSummary = false;

  private async requestSummary() {
    if (this.isRequestingSummary)
      return;

    this.isRequestingSummary = true;
    try {
      const users = [...this.users.values()];

      const user = users[Math.floor(Math.random() * users.length)];

      console.log(`Requesting summary from client ${user.clientId} (${user.username})`);

      const response = await user.socket.emitWithAck('requestSummary');

      if ('summary' in response) {
        this.orderingService.appendSummary(user.clientId, response.sequenceNumber, response.summary);
        return;
      }

      if ('error' in response) {
        console.log(`Client ${user.clientId} could not generate summary with reason "${response.error}"`);
      }
    }
    finally {
      this.isRequestingSummary = false;
    }

    this.requestSummary().then();
  }
}
