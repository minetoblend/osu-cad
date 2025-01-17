import type { DependencyContainer, ReadonlyDependencyContainer } from '@osucad/framework';
import type { MultiplayerEditorBeatmap } from './MultiplayerEditorBeatmap';
import { Editor } from '../Editor';
import { MultiplayerClient } from './MultiplayerClient';

export class MultiplayerEditor extends Editor {
  constructor(editorBeatmap: MultiplayerEditorBeatmap) {
    super(editorBeatmap);
  }

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  override editorBeatmap!: MultiplayerEditorBeatmap;

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    this.addInternal(this.editorBeatmap.client);

    this.#dependencies.provide(MultiplayerClient, this.editorBeatmap.client);

    return await super.loadAsync(dependencies);
  }
}
