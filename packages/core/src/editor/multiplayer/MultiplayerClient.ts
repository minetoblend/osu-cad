import type { ClientMessages, IMutation, InitialStateServerMessage, MutationContext, MutationsSubmittedMessage, ServerMessages } from '@osucad/multiplayer';
import type { Socket } from 'socket.io-client';
import type { Beatmap } from '../../beatmap/Beatmap';
import type { FileStore } from '../../beatmap/io/FileStore';
import { Component } from '@osucad/framework';
import { MutationSource, UpdateHandler } from '@osucad/multiplayer';
import { io } from 'socket.io-client';
import { SimpleFile } from '../../beatmap/io/SimpleFile';
import { StaticFileStore } from '../../beatmap/io/StaticFileStore';
import { RulesetStore } from '../../rulesets/RulesetStore';

export class MultiplayerClient extends Component {
  constructor(url: string) {
    super();
    this.ws = io(url, {
      autoConnect: false,
      transports: ['websocket'],
    });

    this.ws.on('mutationsSubmitted', msg => this.mutationSubmitted(msg));
  }

  updateHandler!: UpdateHandler;

  readonly ws: Socket<ServerMessages, ClientMessages>;

  clientId!: number;

  beatmap!: Beatmap<any>;

  fileStore!: FileStore;

  protected override loadComplete() {
    super.loadComplete();

    this.scheduler.addDelayed(() => this.flush(), 25, true);
  }

  async connect() {
    this.ws.connect();

    const initialState = await new Promise<InitialStateServerMessage>((resolve, reject) => {
      this.ws.once('connect_error', reject);
      this.ws.once('initialData', resolve);
    });

    this.clientId = initialState.clientId;

    const rulesetInfo = RulesetStore.getByShortName(initialState.beatmap.ruleset);
    if (!rulesetInfo || !rulesetInfo.available)
      throw new Error(`Ruleset "${initialState.beatmap.ruleset}" not available`);

    const ruleset = rulesetInfo.createInstance();

    this.beatmap = ruleset.createBeatmap();
    this.beatmap.beatmapInfo.ruleset = rulesetInfo;
    this.beatmap.initializeFromSummary(initialState.beatmap.data);

    this.updateHandler = new UpdateHandler(this.beatmap);
    this.updateHandler.attach(this.beatmap);

    const assets = initialState.assets.map(it => new SimpleFile(
      it.path,
      () => fetch(`http://localhost:3000/assets/${it.id}`).then(it => it.arrayBuffer()),
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

    console.log(msg.mutations);

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

    this.ws.emit('submitMutations', {
      version: this.updateHandler.version++,
      mutations: this.bufferedMutations,
    });
    this.bufferedMutations = [];
  }
}
