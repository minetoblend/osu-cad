import type { SharedStructure } from '../dataStructures/SharedStructure';
import type { IMutation } from '../protocol/IMutation';
import type { InitialStateServerMessage, OpsSubmittedServerMessage, PresenceUpdatedServerMessage, ServerMessage, UserJoinedServerMessage, UserLeftServerMessage } from '../protocol/ServerMessage';
import type { SummaryMessage } from '../protocol/types';
import { Action, Component } from '@osucad/framework';
import { UpdateHandler } from '../dataStructures/UpdateHandler';
import { ClientSocket } from './Socket';

export abstract class AbstractMultiplayerClient<T extends SharedStructure> extends Component {
  protected constructor(
    readonly url: string,
    readonly token: string,
  ) {
    super();
  }

  socket!: ClientSocket;

  clientId!: number;

  #document!: T;

  get document() {
    return this.#document;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.scheduler.addDelayed(() => this.#flush(), 25, true);
  }

  async connect(): Promise<void> {
    if (this.socket)
      throw new Error('Already connected');

    this.socket = new ClientSocket(this.url, this.token);

    this.socket.messageReceived.addListener(this.#handleMessage, this);

    const initialState = await this.socket.receive();
    if (initialState.type !== 'initial_state')
      throw new Error('Invalid initial message');

    this.clientId = initialState.clientId;

    this.#document = await this.initializeFromSummary(initialState.document.summary);

    this.handleInitialState(initialState);

    this.#latestSequenceNumber = initialState.document.summary.sequenceNumber;

    this.updateHandler = new UpdateHandler(this.document);
    this.updateHandler.attach(this.document);

    for (const message of initialState.document.ops) {
      for (const op of message.ops)
        this.updateHandler.process(JSON.parse(op), true);
    }

    this.updateHandler.commandApplied.addListener(mutation => this.onLocalMutation(mutation));
  }

  protected abstract initializeFromSummary(summary: SummaryMessage): Promise<T>;

  updateHandler!: UpdateHandler;

  #latestSequenceNumber!: string;

  readonly messageReceived = new Action<ServerMessage>();

  #buffer: string[] = [];

  protected onLocalMutation(mutation: IMutation) {
    this.#buffer.push(JSON.stringify(mutation));
  }

  #handleMessage(message: ServerMessage) {
    switch (message.type) {
      case 'initial_state':
        // already handled in connect() method
        return;
      case 'ops_submitted':
        this.handleOpsSubmitted(message);
        return;
      case 'user_joined':
        this.handleUserJoined(message);
        return;
      case 'user_left':
        this.handleUserLeft(message);
        return;
      case 'presence_updated':
        this.handlePresenceUpdated(message);
    }
  }

  protected handleOpsSubmitted(msg: OpsSubmittedServerMessage) {
    for (const op of msg.ops) {
      const local = op.clientId === this.clientId;

      this.#latestSequenceNumber = op.sequenceNumber;

      for (const mutation of op.ops)
        this.updateHandler.process(JSON.parse(mutation), local);
    }
  }

  protected handleInitialState(msg: InitialStateServerMessage) {}

  protected handleUserJoined(msg: UserJoinedServerMessage) {}

  protected handleUserLeft(msg: UserLeftServerMessage) {}

  protected handlePresenceUpdated(msg: PresenceUpdatedServerMessage) {}

  #flush() {
    if (this.#buffer.length === 0)
      return;

    this.socket.send({
      type: 'submit_ops',
      version: this.updateHandler.version++,
      ops: this.#buffer,
    });

    this.#buffer = [];
  }
}
