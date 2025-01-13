import type { DrawableRuleset } from '@osucad/common';
import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { BottomAlignedTickDisplay, CurrentTimeOverlay, editorScreen, EditorScreen, HitObjectSelectionManager, IBeatmap, OsucadColors, Ruleset, Timeline } from '@osucad/common';
import { Anchor, Axes, Box, Container, EmptyDrawable, provide, resolved } from 'osucad-framework';

const timelineHeight = 80;

@editorScreen({
  id: 'viewport',
  name: 'Viewport',
})
export class ViewportScreen extends EditorScreen {
  @resolved(Ruleset)
  ruleset!: Ruleset;

  @resolved(IBeatmap)
  beatmap!: IBeatmap;

  #drawableRuleset!: DrawableRuleset;

  @provide()
  selectionManager = new HitObjectSelectionManager();

  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      this.selectionManager,
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: timelineHeight },
        child: new Container({
          relativeSizeAxes: Axes.Both,
          padding: 20,
          child: this.#drawableRuleset = this.ruleset.createDrawableEditorRulesetWith(this.beatmap),
        }),
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        height: timelineHeight,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: OsucadColors.translucent,
            alpha: 0.5,
          }),
          new Timeline({
            children: [
              new BottomAlignedTickDisplay({
                height: 0.15,
                anchor: Anchor.BottomLeft,
                origin: Anchor.BottomLeft,
              }),
              new Container({
                relativeSizeAxes: Axes.Both,
                height: 0.65,
                anchor: Anchor.CenterLeft,
                origin: Anchor.CenterLeft,
                child:
                  this.ruleset.createEditorRuleset()?.createTimelineHitObjectContainer() ?? new EmptyDrawable(),
              }),
            ],
          }),
          new CurrentTimeOverlay(),
        ],
      }),
    );

    this.#drawableRuleset.playfield.addAll(
      // new PlayfieldGrid(),
      // new OsuSelectionBlueprintContainer().adjust((it) => {
      //   it.readonly = true;
      //   it.depth = -1;
      // }),
    );
  }
}
