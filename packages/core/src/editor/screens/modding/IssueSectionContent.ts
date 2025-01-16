import type { Container, ReadonlyDependencyContainer } from '@osucad/framework';
import type { Check } from '../../../verifier/Check';
import type { Issue } from '../../../verifier/Issue';
import type { IssueSection } from './IssueSection';
import { Anchor, Axes, DrawableSprite, FillDirection, FillFlowContainer, Vec2 } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../OsucadColors';
import { DrawableIssue } from './DrawableIssue';
import { DrawableIssueGroup } from './DrawableIssueGroup';

export class IssueSectionContent extends FillFlowContainer {
  constructor(readonly section: IssueSection) {
    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      direction: FillDirection.Vertical,
      spacing: new Vec2(4),
    });
  }

  override get disposeOnDeathRemoval(): boolean {
    return false;
  }

  #noIssuesContainer!: Container;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.add(this.#noIssuesContainer = new FillFlowContainer({
      autoSizeAxes: Axes.Both,
      direction: FillDirection.Horizontal,
      spacing: new Vec2(4),
      anchor: Anchor.TopCenter,
      origin: Anchor.TopCenter,
      padding: { vertical: 20 },
      children: [
        new DrawableSprite({
          size: 32,
          texture: getIcon('issue-check'),
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }),
        new OsucadSpriteText({
          text: 'No issues found',
          fontSize: 18,
          color: OsucadColors.text,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }),
      ],
      alpha: 0,
    }));

    for (const issue of this.section.issues)
      this.addIssue(issue);

    this.section.issueAdded.addListener(this.addIssue, this);
  }

  #issueGroups = new Map<Check, DrawableIssueGroup>();

  addIssue(issue: Issue) {
    let group = this.#issueGroups.get(issue.check);
    if (!group) {
      this.add(group = new DrawableIssueGroup(issue.check));
      this.#issueGroups.set(issue.check, group);
    }

    group.add(new DrawableIssue(issue));
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.section.issueAdded.removeListener(this.addIssue, this);
  }

  override updateAfterChildren() {
    super.updateAfterChildren();

    if (this.aliveInternalChildren.every(it => !(it instanceof DrawableIssueGroup))) {
      this.#noIssuesContainer.show();
    }
    else {
      this.#noIssuesContainer.hide();
    }
  }
}
