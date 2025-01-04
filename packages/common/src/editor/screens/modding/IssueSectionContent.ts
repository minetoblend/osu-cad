import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { Check } from '../../../verifier/Check';
import type { Issue } from '../../../verifier/Issue';
import type { IssueSection } from './IssueSection';
import { Axes, FillDirection, FillFlowContainer, Vec2 } from 'osucad-framework';
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

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

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
}
