import type { SummaryMessage, UserJoinedServerMessage, UserLeftServerMessage } from '@osucad/multiplayer';
import type { FileStore } from '../../beatmap/io/FileStore';
import { AbstractMultiplayerClient } from '@osucad/multiplayer';
import { SimpleFile } from '../../beatmap/io/SimpleFile';
import { StaticFileStore } from '../../beatmap/io/StaticFileStore';
import { BoxedBeatmap } from './BoxedBeatmap';
import { ConnectedUsers } from './ConnectedUsers';

export class OsucadMultiplayerClient extends AbstractMultiplayerClient<BoxedBeatmap> {
  constructor(url: string, token: string) {
    super(url, token);
  }

  readonly users = new ConnectedUsers(this);

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

  protected override handleUserJoined(msg: UserJoinedServerMessage) {
    super.handleUserJoined(msg);
  }

  protected override handleUserLeft(msg: UserLeftServerMessage) {
    super.handleUserLeft(msg);
  }
}
