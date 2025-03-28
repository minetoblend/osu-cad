import type { OsucadScreen } from '@osucad/core';
import type { DependencyContainer, ReadonlyDependencyContainer } from '@osucad/framework';
import { APIProvider, IEndpointConfiguration, ISkinSource, OsucadGameBase, OsucadScreenStack, PreferencesOverlay, RulesetStore, SkinManager, UISamples } from '@osucad/core';
import { Axes, Container, provide } from '@osucad/framework';
import { ManiaRuleset } from '@osucad/ruleset-mania';
import { OsuRuleset } from '@osucad/ruleset-osu';
import { Toolbar } from './overlays/Toolbar';
import { LandingScreen } from './screens/landing/LandingScreen';

export class OsucadWebGame extends OsucadGameBase {
  @provide(SkinManager)
  @provide(ISkinSource)
  readonly skinManager = new SkinManager();

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  @provide(APIProvider)
  readonly api = new APIProvider();

  @provide(IEndpointConfiguration)
  endpoint: IEndpointConfiguration = {
    apiV1Endpoint: import.meta.env.VITE_API_BASE_URL,
  };

  @provide(PreferencesOverlay)
  readonly preferences = new PreferencesOverlay();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addParallelLoad(this.loadComponentAsync(this.skinManager));

    const samples = new UISamples(this.audioManager, this.mixer.userInterface);
    this.#dependencies.provide(UISamples, samples);
    this.addParallelLoad(samples.load());

    RulesetStore.register(new OsuRuleset().rulesetInfo);
    RulesetStore.register(new ManiaRuleset().rulesetInfo);

    this.addRange([
      this.api,
      this.screenOffsetContainer = new Container({
        relativeSizeAxes: Axes.Both,
        children: [
          this.#screenStack = new OsucadScreenStack(),
        ],
      }),
      this.#toolbarContainer = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.#overlayOffsetContainer = new Container({
        relativeSizeAxes: Axes.Both,
      }),
    ]);
  }

  screenOffsetContainer!: Container;

  #screenStack!: OsucadScreenStack;

  #toolbarContainer!: Container;

  #overlayOffsetContainer!: Container;

  protected override loadComplete() {
    super.loadComplete();

    this.#screenStack.screenPushed.addListener((evt) => {
      if ((evt.newScreen as OsucadScreen).hideOverlaysOnEnter)
        this.toolbar.hide();
      else
        this.toolbar.show();
    });

    this.#screenStack.screenExited.addListener((evt) => {
      if ((evt.newScreen as OsucadScreen).hideOverlaysOnEnter)
        this.toolbar.hide();
      else
        this.toolbar.show();
    });

    this.#overlayOffsetContainer.add(this.preferences);

    this.#toolbarContainer.add(this.toolbar = new Toolbar());

    this.#screenStack.push(new LandingScreen());
  }

  toolbar!: Toolbar;

  override updateAfterChildren() {
    super.updateAfterChildren();

    const toolbarOffset = this.toolbar.y + this.toolbar.drawHeight;

    this.screenOffsetContainer.padding = { top: toolbarOffset };

    this.screenOffsetContainer.x = this.preferences.panelOffset * 0.5;
  }
}
