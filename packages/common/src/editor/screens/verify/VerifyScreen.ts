import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { Anchor, Axes, Box, Container, Direction, provide, resolved } from 'osucad-framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { OsucadScrollContainer } from '../../../drawables/OsucadScrollContainer';
import { OsucadColors } from '../../../OsucadColors';
import { OsuSelectionBlueprintContainer } from '../../../rulesets/osu/edit/selection/OsuSelectionBlueprintContainer';
import { Ruleset } from '../../../rulesets/Ruleset';
import { EditorBeatmap } from '../../EditorBeatmap';
import { EditorPlayfieldContainer } from '../../EditorPlayfieldContainer';
import { BottomAlignedTickDisplay } from '../../ui/timeline/BottomAlignedTickDisplay';
import { CurrentTimeOverlay } from '../../ui/timeline/CurrentTimeOverlay';
import { TimelineHitObjectBlueprintContainer } from '../../ui/timeline/hitObjects/TimelineHitObjectBlueprintContainer';
import { Timeline } from '../../ui/timeline/Timeline';
import { HitObjectSelectionManager } from '../compose/HitObjectSelectionManager';
import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';
import { IssueList } from './IssueList';

@editorScreen({
  id: 'verify',
  name: 'Verify',
})
export class VerifyScreen extends EditorScreen {
  @resolved(Ruleset)
  ruleset!: Ruleset;

  @resolved(IBeatmap)
  beatmap!: IBeatmap;

  @resolved(EditorBeatmap)
  editorBeatmap!: EditorBeatmap;

  @provide(HitObjectSelectionManager)
  readonly selectionManager = new HitObjectSelectionManager();

  protected override get applySafeAreaPadding(): boolean {
    return false;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const timelineHeight = 70;

    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.Both,
        width: 0.6,
        children: [
          this.selectionManager,
          new Container({
            relativeSizeAxes: Axes.Both,
            padding: { horizontal: 40, bottom: 40, top: 40 + timelineHeight },
            child: new EditorPlayfieldContainer().doWhenLoaded(it =>
              it.playfield.add(new OsuSelectionBlueprintContainer().adjust((it) => {
                it.readonly = true;
                it.depth = -1;
              })),
            ),
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
                    child: new TimelineHitObjectBlueprintContainer({
                      readonly: true,
                    }),
                  }),
                ],
              }),
              new CurrentTimeOverlay(),
            ],
          }),
        ],
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        width: 0.4,
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        children: [
          new Box({
            relativeSizeAxes: Axes.Both,
            color: 0x17171B,
          }),
          new OsucadScrollContainer(Direction.Vertical).with({
            relativeSizeAxes: Axes.Both,
            child: new IssueList(),
          }),
        ],
      }),
    );
  }

  #issueList!: Container;
}
