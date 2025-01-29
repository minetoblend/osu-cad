import type { DependencyContainer, ReadonlyDependencyContainer } from '@osucad/framework';
import {
  APIProvider,
  ISkinSource,
  MultiplayerClient,
  MultiplayerEditor,
  MultiplayerEditorBeatmap,
  OsucadGameBase,
  OsucadScreenStack,
  RulesetStore,
  SkinManager,
  UISamples,
} from '@osucad/core';
import { provide } from '@osucad/framework';
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
      this.#screenStack = new OsucadScreenStack(),
    ]);
  }

  #screenStack!: OsucadScreenStack;

  protected override loadComplete() {
    super.loadComplete();

    this.add(
      this.toolbar = new Toolbar(),
    );

    this.#screenStack.push(new LandingScreen());
  }

  async loadEditor() {
    const client = new MultiplayerClient(
      window.location.search.endsWith('?second-server')
        ? 'http://localhost:3001'
        : 'http://localhost:3000',
    );

    await client.connect();

    this.#screenStack.push(new MultiplayerEditor(new MultiplayerEditorBeatmap(client)));
  }

  toolbar!: Toolbar;

  override update() {
    super.update();

    this.#screenStack.height = this.content.drawHeight - this.toolbar.drawHeight - this.toolbar.y;
    this.#screenStack.y = this.toolbar.y + this.toolbar.drawHeight;
  }
}
