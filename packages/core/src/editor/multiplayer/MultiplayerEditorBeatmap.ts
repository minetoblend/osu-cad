import type { UpdateHandler } from '@osucad/multiplayer';
import type { OsucadMultiplayerClient } from './OsucadMultiplayerClient';
import { EditorBeatmap } from '../EditorBeatmap';

export class MultiplayerEditorBeatmap extends EditorBeatmap {
  constructor(
    readonly client: OsucadMultiplayerClient,
  ) {
    super(client.document.beatmap!, client.fileStore);
  }

  protected override createUpdateHandler(): UpdateHandler {
    return this.client.updateHandler;
  }
}
