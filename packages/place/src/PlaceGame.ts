import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { ISkinSource, OsucadGameBase, OsucadScreenStack, PreferencesOverlay, RulesetStore, SkinManager } from '@osucad/core';
import { Axes, Container, provide } from '@osucad/framework';
import { OsuRuleset } from '@osucad/ruleset-osu';
import { PlaceClient } from './editor/PlaceClient';
import { PlaceEditor } from './editor/PlaceEditor';

export class PlaceGame extends OsucadGameBase {
  @provide(SkinManager)
  @provide(ISkinSource)
  readonly skinManager = new SkinManager();

  @provide(PreferencesOverlay)
  readonly preferences = new PreferencesOverlay();

  readonly screenStack = new OsucadScreenStack();

  #overlayOffsetContainer!: Container;

  #screenOffsetContainer!: Container;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    RulesetStore.register(new OsuRuleset().rulesetInfo);

    this.addRange([
      this.#screenOffsetContainer = new Container({
        relativeSizeAxes: Axes.Both,
        child: this.screenStack,
      }),
      this.#overlayOffsetContainer = new Container({
        relativeSizeAxes: Axes.Both,
      }),
    ]);
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await Promise.all([
      super.loadAsync(dependencies),
      this.loadComponentAsync(this.skinManager),
    ]);
  }

  protected loadComplete() {
    super.loadComplete();

    this.#overlayOffsetContainer.add(this.preferences);

    const client = new PlaceClient();
    client.load().then(() => this.screenStack.push(new PlaceEditor(client.beatmap)));
  }

  override updateAfterChildren() {
    super.updateAfterChildren();

    this.#screenOffsetContainer.x = this.preferences.panelOffset * 0.5;
  }
}
