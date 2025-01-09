import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { DummyEditorBeatmap, Editor, ISkinSource, OsucadGameBase, OsucadScreenStack, OsuRuleset, RulesetStore, SkinManager } from '@osucad/common';
import { ManiaRuleset } from '@osucad/ruleset-mania';
import { provide } from 'osucad-framework';

export class OsucadWebGame extends OsucadGameBase {
  @provide(SkinManager)
  @provide(ISkinSource)
  readonly skinManager = new SkinManager();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    RulesetStore.register(OsuRuleset.rulesetInfo);
    RulesetStore.register(new ManiaRuleset().rulesetInfo);

    this.addParallelLoad(this.loadComponentAsync(this.skinManager));

    this.add(this.#screenStack = new OsucadScreenStack());
  }

  #screenStack!: OsucadScreenStack;

  protected loadComplete() {
    super.loadComplete();

    this.#screenStack.push(new Editor(new DummyEditorBeatmap()));
  }
}
