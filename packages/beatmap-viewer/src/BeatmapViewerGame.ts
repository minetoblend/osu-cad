import type { DependencyContainer, ReadonlyDependencyContainer } from '@osucad/framework';
import { ISkinSource, OsucadGameBase, PreferencesOverlay, RulesetStore, SkinManager, UISamples } from '@osucad/core';
import { Axes, Container, provide } from '@osucad/framework';
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

  @provide(PreferencesOverlay)
  readonly preferences = new PreferencesOverlay();

  get skinManagerLoaded() {
    return this.#skinManagerLoaded;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addRange([
      this.#screenOffsetContainer = new Container({
        relativeSizeAxes: Axes.Both,
        child: new Router(),
      }),
      this.#overlayOffsetContainer = new Container({
        relativeSizeAxes: Axes.Both,
      }),
    ]);

    this.#skinManager = new SkinManager();

    this.#dependencies.provide(SkinManager, this.#skinManager);
    this.#dependencies.provide(ISkinSource, this.#skinManager);

    this.#skinManagerLoaded = this.loadComponentAsync(this.#skinManager);

    RulesetStore.register(new OsuRuleset().rulesetInfo);
    RulesetStore.register(new ManiaRuleset().rulesetInfo);
  }

  #overlayOffsetContainer!: Container;

  #screenOffsetContainer!: Container;

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

    this.#overlayOffsetContainer.add(this.preferences);
  }

  override updateAfterChildren() {
    super.updateAfterChildren();

    this.#screenOffsetContainer.x = this.preferences.panelOffset * 0.5;
  }
}
