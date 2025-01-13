import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { DummyEditorBeatmap, Editor, ISkinSource, OsucadGameBase, OsucadScreenStack, RulesetStore, SkinManager } from '@osucad/common';
import { ManiaRuleset } from '@osucad/ruleset-mania';
import { OsuRuleset } from '@osucad/ruleset-osu';
import { provide } from 'osucad-framework';

export class OsucadWebGame extends OsucadGameBase {
  @provide(SkinManager)
  @provide(ISkinSource)
  readonly skinManager = new SkinManager();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addParallelLoad(this.loadComponentAsync(this.skinManager));

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
