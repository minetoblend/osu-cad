import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { DummyEditorBeatmap, Editor, ISkinSource, OsucadGameBase, OsucadScreenStack, OsuRuleset, RulesetStore, SkinManager, Slider } from '@osucad/common';
import { HoldNote, ManiaBeatmap, ManiaRuleset, Note, StageDefinition } from '@osucad/ruleset-mania';
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
      otherBeatmap.hitObjects.items.map((it) => {
        let note = new Note();

        if (it instanceof Slider) {
          note = new HoldNote();
          (note as HoldNote).duration = it.duration;
        }

        note.startTime = it.startTime;
        note.column = Math.floor(Math.random() * 4);

        return note;
      }),
    );

    const editorBeatmap = new DummyEditorBeatmap(beatmap as any);

    this.#screenStack.push(new Editor(editorBeatmap));
  }
}
