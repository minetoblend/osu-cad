import type { ScreenTransitionEvent } from '@osucad/framework';
import { MultiplayerEditor, MultiplayerEditorBeatmap, OsucadMultiplayerClient, OsucadScreen } from '@osucad/core';

export class EditorLoader extends OsucadScreen {
  constructor(readonly id: string) {
    super();
  }

  override onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.#loadEditor();
  }

  async #loadEditor() {
    const { accessToken } = await fetch(`/api/v1/rooms/${this.id}/token`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => res.json());

    const client = new OsucadMultiplayerClient(
      `${window.origin}/api/multiplayer`,
      accessToken,
    );

    await client.connect();

    this.screenStack.push(new MultiplayerEditor(new MultiplayerEditorBeatmap(client)));
  }

  override onResuming(e: ScreenTransitionEvent) {
    this.exit();
  }
}
