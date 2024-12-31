import type { ReadonlyDependencyContainer } from 'osucad-framework';
import { Anchor, Axes, Box, Container, Direction, FillFlowContainer, provide, resolved, Vec2 } from 'osucad-framework';
import { IBeatmap } from '../../../beatmap/IBeatmap';
import { OsucadScrollContainer } from '../../../drawables/OsucadScrollContainer';
import { OsuSelectionBlueprintContainer } from '../../../rulesets/osu/edit/selection/OsuSelectionBlueprintContainer';
import { Ruleset } from '../../../rulesets/Ruleset';
import { EditorBeatmap } from '../../EditorBeatmap';
import { EditorPlayfieldContainer } from '../../EditorPlayfieldContainer';
import { HitObjectSelectionManager } from '../compose/HitObjectSelectionManager';
import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';

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

  @provide()
  readonly selectionManager = new HitObjectSelectionManager();

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.Both,
        width: 0.6,
        padding: 40,
        children: [
          this.selectionManager,
          new EditorPlayfieldContainer().doWhenLoaded(it =>
            it.playfield.add(new OsuSelectionBlueprintContainer().adjust((it) => {
              it.readonly = true;
              it.depth = -1;
            })),
          ),
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
            child: new FillFlowContainer({
              relativeSizeAxes: Axes.X,
              autoSizeAxes: Axes.Y,
              padding: 20,
              spacing: new Vec2(6),
              children: [
                ...this.ruleset.createBeatmapVerifier()?.getIssues(this.editorBeatmap) ?? [],
              ],
            }),
          }),
        ],
      }),
    );
  }

  #issueList!: Container;
}
