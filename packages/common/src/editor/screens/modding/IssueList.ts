import type { ClickEvent, Drawable, HoverEvent, MouseDownEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { BeatmapCheck } from '../../../verifier/BeatmapCheck';
import type { BeatmapVerifier } from '../../../verifier/BeatmapVerifier';
import { Anchor, Axes, Box, Container, Direction, FillFlowContainer, resolved, Vec2 } from 'osucad-framework';
import { OsucadScrollContainer } from '../../../drawables/OsucadScrollContainer';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../OsucadColors';
import { Ruleset } from '../../../rulesets/Ruleset';
import { EditorBeatmap } from '../../EditorBeatmap';
import { DrawableIssue } from './DrawableIssue';
import { DrawableIssueGroup } from './DrawableIssueGroup';

export class IssueList extends Container {
  @resolved(Ruleset)
  ruleset!: Ruleset;

  @resolved(EditorBeatmap)
  beatmap!: EditorBeatmap;

  #content!: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x17171B,
      }),
      new OsucadScrollContainer(Direction.Vertical).with({
        relativeSizeAxes: Axes.Both,
        child: this.#content = new FillFlowContainer({
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
          padding: 20,
          spacing: new Vec2(10),
        }),
      }),
    );
  }

  protected override loadComplete() {
    super.loadComplete();

    const verifier = this.ruleset.createBeatmapVerifier();

    if (verifier)
      this.createIssues(verifier);
  }

  #issueGroups = new Map<BeatmapCheck<any>, DrawableIssueGroup>();

  createIssues(verifier: BeatmapVerifier) {
    for (const issue of verifier.getIssues(this.beatmap)) {
      let group = this.#issueGroups.get(issue.check);
      if (!group) {
        this.add(group = new DrawableIssueGroup(issue.check));
        this.#issueGroups.set(issue.check, group);
      }

      group.add(new DrawableIssue(issue));
    }

    if (this.#issueGroups.size === 0) {
      this.add(new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: { vertical: 25 },
        child: new OsucadSpriteText({
          text: 'No issues found.',
          anchor: Anchor.TopCenter,
          origin: Anchor.TopCenter,
          color: OsucadColors.text,
        }),
      }));
    }
  }

  override onHover(e: HoverEvent): boolean {
    return true;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    return true;
  }

  override onClick(e: ClickEvent): boolean {
    return true;
  }
}
