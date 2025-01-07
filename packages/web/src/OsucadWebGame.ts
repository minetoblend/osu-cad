import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { DummyEditorBeatmap, Editor, ISkinSource, OsucadGameBase, OsucadScreenStack, OsuRuleset, RulesetStore, SkinManager } from '@osucad/common';
import { provide } from 'osucad-framework';

export class OsucadWebGame extends OsucadGameBase {
  @provide(SkinManager)
  @provide(ISkinSource)
  readonly skinManager = new SkinManager();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    RulesetStore.register(new OsuRuleset(), 0);

    this.addParallelLoad(this.loadComponentAsync(this.skinManager));

    this.add(this.#screenStack = new OsucadScreenStack());
  }

  #screenStack!: OsucadScreenStack;

  protected loadComplete() {
    super.loadComplete();

    const beatmap = new DummyEditorBeatmap();

    this.#screenStack.push(new Editor(beatmap));
  }
}
