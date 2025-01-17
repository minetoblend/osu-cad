import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { MultiplayerEditorBeatmap } from './MultiplayerEditorBeatmap';
import { Editor } from '../Editor';

export class MultiplayerEditor extends Editor {
  constructor(editorBeatmap: MultiplayerEditorBeatmap) {
    super(editorBeatmap);
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    this.addInternal((this.editorBeatmap as MultiplayerEditorBeatmap).client);

    return await super.loadAsync(dependencies);
  }
}
