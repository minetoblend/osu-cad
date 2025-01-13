import type { DependencyContainer, ReadonlyDependencyContainer } from 'osucad-framework';
import { ISkinSource, OsucadGameBase, RulesetStore, SkinManager, UISamples } from '@osucad/common';
import { ManiaRuleset } from '@osucad/ruleset-mania';
import { OsuRuleset } from '@osucad/ruleset-osu';
import { RenderTarget } from 'pixi.js';
import { Router } from './screens/Router';

export class BeatmapViewerGame extends OsucadGameBase {
  constructor() {
    super();

    RenderTarget.defaultOptions.depth = true;
    RenderTarget.defaultOptions.stencil = true;
  }

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

    this.add(new Router());

    this.#skinManager = new SkinManager();

    this.#dependencies.provide(SkinManager, this.#skinManager);
    this.#dependencies.provide(ISkinSource, this.#skinManager);

    this.#skinManagerLoaded = this.loadComponentAsync(this.#skinManager);

    RulesetStore.register(new OsuRuleset().rulesetInfo);
    RulesetStore.register(new ManiaRuleset().rulesetInfo);
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
}
