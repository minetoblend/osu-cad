import type { EditorBeatmap } from '@osucad/common';
import type { Editor } from '@osucad/editor';
import type { MultiplayerEditorBeatmap } from '@osucad/multiplayer';
import { EditorLoader } from '@osucad/editor/editor/EditorLoader';

export class MultiplayerEditorLoader extends EditorLoader {
  protected async createEditor(beatmap: EditorBeatmap): Promise<Editor> {
    return import('./MultiplayerEditor').then(({ MultiplayerEditor }) =>
      new MultiplayerEditor(beatmap as MultiplayerEditorBeatmap),
    );
  }
}
