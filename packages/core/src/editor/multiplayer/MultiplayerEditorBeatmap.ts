import type { UpdateHandler } from '@osucad/multiplayer';
import type { MultiplayerClient } from './MultiplayerClient';
import { EditorBeatmap } from '../EditorBeatmap';

export class MultiplayerEditorBeatmap extends EditorBeatmap {
  constructor(
    readonly client: MultiplayerClient,
  ) {
    super(client.beatmap, client.fileStore);
  }

  protected override createUpdateHandler(): UpdateHandler {
    return this.client.updateHandler;
  }
}
