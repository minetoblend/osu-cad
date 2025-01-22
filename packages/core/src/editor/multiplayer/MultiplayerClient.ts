import type { ClientSocket, IMutation, InitialStateServerMessage, MutationContext, MutationsSubmittedMessage, SummaryResponse } from '@osucad/multiplayer';
import type { Beatmap } from '../../beatmap/Beatmap';
import type { FileStore } from '../../beatmap/io/FileStore';
import { Component } from '@osucad/framework';
import { MutationSource, UpdateHandler } from '@osucad/multiplayer';
import { io } from 'socket.io-client';
import msgPackParser from 'socket.io-msgpack-parser';
import { SimpleFile } from '../../beatmap/io/SimpleFile';
import { StaticFileStore } from '../../beatmap/io/StaticFileStore';
import { BoxedBeatmap } from './BoxedBeatmap';
import { ConnectedUsers } from './ConnectedUsers';

export class MultiplayerClient extends Component {
  constructor(readonly url: string) {
    super();
    this.socket = io(url, {
      autoConnect: false,
      transports: ['websocket'],
      parser: msgPackParser,
    });

    this.socket.on('mutationsSubmitted', msg => this.mutationSubmitted(msg));
    this.socket.on('requestSummary', cb => cb(this.createSummaryResponse()));

    this.users = new ConnectedUsers(this);
  }

  readonly socket: ClientSocket;

  readonly users: ConnectedUsers;

  updateHandler!: UpdateHandler;

  clientId!: number;

  beatmap!: Beatmap<any>;

  fileStore!: FileStore;

  protected override loadComplete() {
    super.loadComplete();

    this.scheduler.addDelayed(() => this.flush(), 25, true);
  }

  async connect() {
    this.socket.connect();

    const initialState = await new Promise<InitialStateServerMessage>((resolve, reject) => {
      this.socket.once('connect_error', reject);
      this.socket.once('initialData', resolve);
    });

    this.clientId = initialState.clientId;

    const beatmap = new BoxedBeatmap();

    beatmap.initializeFromSummary(initialState.document.summary);

    this.#latestSequenceNumber = initialState.document.sequenceNumber;

    if (!beatmap.beatmap)
      throw new Error('Beatmap failed to initialize');

    this.beatmap = beatmap.beatmap;

    this.updateHandler = new UpdateHandler(this.beatmap);
    this.updateHandler.attach(this.beatmap);

    for (const op of initialState.document.ops) {
      const ctx: MutationContext = {
        source: MutationSource.Remote,
        version: op.version,
      };

      for (const mutation of op.mutations)
        this.updateHandler.apply(JSON.parse(mutation), ctx);
    }

    const assets = initialState.assets.map(it => new SimpleFile(
      it.path,
      () => fetch(`${this.url}/api/assets/${it.id}`).then(it => it.arrayBuffer()),
    ));

    this.fileStore = new StaticFileStore(assets);

    this.updateHandler.commandApplied.addListener(mutation => this.onLocalMutation(mutation));
  }

  private mutationSubmitted(msg: MutationsSubmittedMessage) {
    const isAck = msg.clientId === this.clientId;

    const ctx: MutationContext = {
      version: msg.version,
      source: isAck
        ? MutationSource.Ack
        : MutationSource.Remote,
    };

    if (isAck)
      this.#latestAckVersion = msg.version;

    this.#latestSequenceNumber = msg.sequenceNumber;

    for (const mutation of msg.mutations)
      this.updateHandler.apply(JSON.parse(mutation), ctx);
  }

  #latestAckVersion = 0;
  #latestSequenceNumber = '';

  buffer: string[] = [];

  onLocalMutation(mutation: IMutation) {
    this.buffer.push(JSON.stringify(mutation));
  }

  flush() {
    if (this.buffer.length === 0)
      return;

    this.socket.emit('submitMutations', {
      version: this.updateHandler.version++,
      mutations: this.buffer,
    });
    this.buffer = [];
  }

  createSummaryResponse(): SummaryResponse {
    if (this.#latestAckVersion !== this.updateHandler.version - 1)
      return { error: 'has-pending-ops' };

    return {
      summary: new BoxedBeatmap(this.beatmap).createSummary(),
      sequenceNumber: this.#latestSequenceNumber,
    };
  }
}
