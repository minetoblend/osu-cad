import type { ClientSocket, IMutation, InitialStateServerMessage, MutationContext, MutationsSubmittedMessage } from '@osucad/multiplayer';
import type { Beatmap } from '../../beatmap/Beatmap';
import type { FileStore } from '../../beatmap/io/FileStore';
import { Component } from '@osucad/framework';
import { MutationSource, UpdateHandler } from '@osucad/multiplayer';
import { io } from 'socket.io-client';
import { SimpleFile } from '../../beatmap/io/SimpleFile';
import { StaticFileStore } from '../../beatmap/io/StaticFileStore';
import { BoxedBeatmap } from './BoxedBeatmap';
import { ConnectedUsers } from './ConnectedUsers';

export class MultiplayerClient extends Component {
  constructor(url: string) {
    super();
    this.socket = io(url, {
      autoConnect: false,
      transports: ['websocket'],
    });

    this.socket.on('mutationsSubmitted', msg => this.mutationSubmitted(msg));

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
        this.updateHandler.apply(mutation, ctx);
    }

    const assets = initialState.assets.map(it => new SimpleFile(
      it.path,
      () => fetch(`/api/assets/${it.id}`).then(it => it.arrayBuffer()),
    ));

    this.fileStore = new StaticFileStore(assets);

    this.updateHandler.commandApplied.addListener(mutation => this.onLocalMutation(mutation));
  }

  private mutationSubmitted(msg: MutationsSubmittedMessage) {
    const ctx: MutationContext = {
      version: msg.version,
      source: msg.clientId === this.clientId
        ? MutationSource.Ack
        : MutationSource.Remote,
    };

    for (const mutation of msg.mutations)
      this.updateHandler.apply(mutation, ctx);
  }

  bufferedMutations: IMutation[] = [];

  onLocalMutation(mutation: IMutation) {
    this.bufferedMutations.push(mutation);
  }

  flush() {
    if (this.bufferedMutations.length === 0)
      return;

    this.socket.emit('submitMutations', {
      version: this.updateHandler.version++,
      mutations: this.bufferedMutations,
    });
    this.bufferedMutations = [];
  }
}
