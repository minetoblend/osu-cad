import type { DependencyContainer, ReadonlyDependencyContainer } from 'osucad-framework';
import { ISkinSource, OsucadGameBase, OsucadScreenStack, OsuRuleset, RulesetStore, SkinManager } from '@osucad/common';
import { UISamples } from '@osucad/editor/UISamples';
import { RenderTarget } from 'pixi.js';
import { HomeScreen } from './screens/home/HomeScreen';

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

  #skinManagerLoaded!: Promise<SkinManager>;

  get skinManagerLoaded() {
    return this.#skinManagerLoaded;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.add(this.#screenStack = new OsucadScreenStack());

    this.#skinManager = new SkinManager();

    this.#dependencies.provide(SkinManager, this.#skinManager);
    this.#dependencies.provide(ISkinSource, this.#skinManager);

    this.#skinManagerLoaded = this.loadComponentAsync(this.#skinManager);

    RulesetStore.register(new OsuRuleset(), 0);
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

    const samples = new UISamples(this.audioManager, this.mixer.userInterface);

    this.#dependencies.provide(samples);

    await Promise.all([
      samples.load(),
    ]);
    this.add(this.#skinManager);
  }

  protected loadComplete() {
    super.loadComplete();

    this.#screenStack.push(new HomeScreen());
    // this.#screenStack.push(new BeatmapViewer(new DummyEditorBeatmap()));
  }
}
