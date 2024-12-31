import type { DependencyContainer, ReadonlyDependencyContainer } from 'osucad-framework';
import { DummyEditorBeatmap, ISkinSource, OsucadGameBase, OsucadScreenStack, SkinManager } from '@osucad/common';
import { RenderTarget } from 'pixi.js';
import { BeatmapViewer } from './screens/viewer/BeatmapViewer';

RenderTarget.defaultOptions.depth = true;
RenderTarget.defaultOptions.stencil = true;

export class BeatmapViewerGame extends OsucadGameBase {
  constructor() {
    super();
  }

  #screenStack!: OsucadScreenStack;

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  #skinManager!: SkinManager;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.add(this.#screenStack = new OsucadScreenStack());

    this.#skinManager = new SkinManager();

    this.#dependencies.provide(SkinManager, this.#skinManager);
    this.#dependencies.provide(ISkinSource, this.#skinManager);
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

    await this.loadComponentAsync(this.#skinManager);
    this.add(this.#skinManager);
  }

  protected loadComplete() {
    super.loadComplete();

    this.#screenStack.push(new BeatmapViewer(new DummyEditorBeatmap()));
  }
}
