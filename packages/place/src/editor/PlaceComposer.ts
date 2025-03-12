import type { DrawableRuleset, IComposeTool } from '@osucad/core';
import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { ComposeScreenTimeline, EditorBeatmap, OsucadColors, Ruleset } from '@osucad/core';
import { Anchor, Axes, Box, CompositeDrawable, Container, provide, resolved } from '@osucad/framework';
import { GlobalHitSoundState, GlobalNewComboBindable } from '@osucad/ruleset-osu';
import { PlaceSelectTool } from './tools/PlaceSelectTool';

export class PlaceComposer extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  @provide()
  readonly newCombo = new GlobalNewComboBindable();

  @provide()
  readonly hitSoundState = new GlobalHitSoundState();

  @resolved(Ruleset)
  ruleset!: Ruleset;

  @resolved(EditorBeatmap)
  beatmap!: EditorBeatmap;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      this.playfieldContainer = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        padding: { top: 80 },
        children: [
          this.#drawableRuleset = this.ruleset.createDrawableEditorRulesetWith(this.beatmap.beatmap),
        ],
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        height: 70,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: OsucadColors.translucent,
            alpha: 0.5,
          }),
          new ComposeScreenTimeline({

          }),
        ],
      }),
    );
  }

  playfieldContainer!: Container;

  #drawableRuleset!: DrawableRuleset;

  protected getTools(): IComposeTool[] {
    return [
      new PlaceSelectTool(),
    ];
  }
}
