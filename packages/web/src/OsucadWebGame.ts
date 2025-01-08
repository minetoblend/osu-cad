import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { DummyEditorBeatmap, Editor, ISkinSource, OsucadGameBase, OsucadScreenStack, OsuRuleset, RulesetStore, SkinManager } from '@osucad/common';
import { ManiaBeatmap, ManiaRuleset, Note, StageDefinition } from '@osucad/ruleset-mania';
import { provide } from 'osucad-framework';

export class OsucadWebGame extends OsucadGameBase {
  @provide(SkinManager)
  @provide(ISkinSource)
  readonly skinManager = new SkinManager();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    RulesetStore.register(OsuRuleset.rulesetInfo);
    RulesetStore.register(new ManiaRuleset().rulesetInfo);
    // RulesetStore.register(new ManiaRuleset());

    this.addParallelLoad(this.loadComponentAsync(this.skinManager));

    this.add(this.#screenStack = new OsucadScreenStack());
  }

  #screenStack!: OsucadScreenStack;

  protected loadComplete() {
    super.loadComplete();

    const beatmap = new ManiaBeatmap(new StageDefinition(4));

    const otherBeatmap = new DummyEditorBeatmap().beatmap;

    beatmap.controlPoints = otherBeatmap.controlPoints;

    beatmap.hitObjects.addAll(
      otherBeatmap.hitObjects.items.map(it => Object.assign(new Note(), { startTime: it.startTime })),
    );

    const editorBeatmap = new DummyEditorBeatmap(beatmap as any);

    this.#screenStack.push(new Editor(editorBeatmap));
  }
}
