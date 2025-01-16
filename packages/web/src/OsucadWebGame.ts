import type { DependencyContainer, ReadonlyDependencyContainer } from '@osucad/framework';
import { DummyEditorBeatmap, Editor, ISkinSource, OsucadGameBase, OsucadScreenStack, RulesetStore, SkinManager, UISamples } from '@osucad/core';
import { provide } from '@osucad/framework';
import { ManiaRuleset } from '@osucad/ruleset-mania';
import { OsuRuleset } from '@osucad/ruleset-osu';

export class OsucadWebGame extends OsucadGameBase {
  @provide(SkinManager)
  @provide(ISkinSource)
  readonly skinManager = new SkinManager();

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addParallelLoad(this.loadComponentAsync(this.skinManager));

    const samples = new UISamples(this.audioManager, this.mixer.userInterface);
    this.#dependencies.provide(UISamples, samples);
    this.addParallelLoad(samples.load());

    RulesetStore.register(new OsuRuleset().rulesetInfo);
    RulesetStore.register(new ManiaRuleset().rulesetInfo);

    this.add(this.#screenStack = new OsucadScreenStack());
  }

  #screenStack!: OsucadScreenStack;

  protected loadComplete() {
    super.loadComplete();

    this.#screenStack.push(new Editor(new DummyEditorBeatmap()));
  }
}
