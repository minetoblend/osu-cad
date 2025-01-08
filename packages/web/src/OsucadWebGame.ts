import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { DummyEditorBeatmap, Editor, ISkinSource, OsucadGameBase, OsucadScreenStack, OsuRuleset, RulesetStore, SkinManager } from '@osucad/common';
import { provide } from 'osucad-framework';

export class OsucadWebGame extends OsucadGameBase {
  @provide(SkinManager)
  @provide(ISkinSource)
  readonly skinManager = new SkinManager();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    RulesetStore.register(OsuRuleset.rulesetInfo);
    // RulesetStore.register(new ManiaRuleset());

    this.addParallelLoad(this.loadComponentAsync(this.skinManager));

    this.add(this.#screenStack = new OsucadScreenStack());
  }

  #screenStack!: OsucadScreenStack;

  protected loadComplete() {
    super.loadComplete();

    const beatmap = new DummyEditorBeatmap(this);

    this.#screenStack.push(new Editor(beatmap));
  }
}
