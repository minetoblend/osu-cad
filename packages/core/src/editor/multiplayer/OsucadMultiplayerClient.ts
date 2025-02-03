import type {
  InitialStateServerMessage,
  PresenceUpdatedServerMessage,
  SummaryMessage,
  UserJoinedServerMessage,
  UserLeftServerMessage,
} from '@osucad/multiplayer';
import type { FileStore } from '../../beatmap/io/FileStore';
import { AbstractMultiplayerClient } from '@osucad/multiplayer';
import { SimpleFile } from '../../beatmap/io/SimpleFile';
import { StaticFileStore } from '../../beatmap/io/StaticFileStore';
import { BoxedBeatmap } from './BoxedBeatmap';
import { UserManager } from './UserManager';

export class OsucadMultiplayerClient extends AbstractMultiplayerClient<BoxedBeatmap> {
  constructor(url: string, token: string) {
    super(url, token);
  }

  readonly users = new UserManager(this);

  fileStore!: FileStore;

  protected override async initializeFromSummary(summary: SummaryMessage): Promise<BoxedBeatmap> {
    const beatmap = new BoxedBeatmap();
    beatmap.initializeFromSummary(JSON.parse(summary.summary));

    const assets = summary.assets.map(it => new SimpleFile(
      it.path,
      () => fetch(`http://localhost:3001/api/v1/blobs/${it.id}`).then(it => it.arrayBuffer()),
    ));

    this.fileStore = new StaticFileStore(assets);

    return beatmap;
  }

  protected override handleInitialState(msg: InitialStateServerMessage) {
    super.handleInitialState(msg);

    for (const user of msg.connectedUsers) {
      if (user.clientId !== this.clientId)
        this.users.onUserJoined(user);
    }
  }

  protected override handleUserJoined(msg: UserJoinedServerMessage) {
    super.handleUserJoined(msg);

    this.users.onUserJoined(msg.client);
  }

  protected override handleUserLeft(msg: UserLeftServerMessage) {
    super.handleUserLeft(msg);

    this.users.onUserLeft(msg.client);
  }

  protected override handlePresenceUpdated(msg: PresenceUpdatedServerMessage) {
    super.handlePresenceUpdated(msg);

    this.users.onPresenceUpdated(msg.clientId, msg.key, msg.value);
  }
}
