import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { Issue } from '../../../verifier/Issue';
import { Anchor, Axes, BindableBoolean, Container, Drawable, DrawableSprite, FillDirection, FillFlowContainer, Vec2 } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { ModdingConfigManager } from '../../../config/ModdingConfigManager';
import { ModdingSettings } from '../../../config/ModdingSettings';
import { arrayify } from '../../../utils/arrayUtils';
import { DrawableTimestamp } from './DrawableTimestamp';
import { IssueMenu } from './IssueMenu';

export class DrawableIssue extends FillFlowContainer {
  constructor(readonly issue: Issue) {
    super({
      direction: FillDirection.Vertical,
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      spacing: new Vec2(4),
    });
  }

  override get removeWhenNotAlive(): boolean {
    return false;
  }

  getIcon() {
    switch (this.issue.level) {
      case 'minor':
        return getIcon('issue-minor');
      case 'warning':
        return getIcon('issue-warning');
      case 'problem':
        return getIcon('issue-problem');
      default:
        return null;
    }
  }

  readonly showMinorIssues = new BindableBoolean(true);

  override get shouldBeAlive(): boolean {
    if (!this.showMinorIssues.value && this.issue.level === 'minor')
      return false;

    return super.shouldBeAlive;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(ModdingConfigManager);
    config.bindWith(ModdingSettings.ShowMinorIssues, this.showMinorIssues);

    let messageLine: Container;

    const icon = this.getIcon();

    this.children = [
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        children: [
          new DrawableSprite({
            size: new Vec2(24),
            texture: icon,
          }),
          messageLine = new FillFlowContainer({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            spacing: new Vec2(3, 4),
            padding: { left: 32, vertical: 1 },
          }),
        ],
      }),
    ];

    if (this.issue.timestamp) {
      if (typeof this.issue.timestamp === 'number') {
        messageLine.add(new DrawableTimestamp(this.issue.timestamp).with({
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }));
      }
      else if (this.issue.timestamp instanceof Drawable) {
        messageLine.add(this.issue.timestamp.with({
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }));
      }
      else {
        const hitObjects = arrayify(this.issue.timestamp).toSorted((a, b) => a.startTime - b.startTime);
        messageLine.add(
          new DrawableTimestamp(hitObjects[0].startTime, hitObjects).with({
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        );
      }
    }

    for (const part of this.issue.message) {
      messageLine.add(part.with({
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }));
    }

    if (this.issue.actions.length > 0) {
      this.add(new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        child: new IssueMenu(this.issue.actions).with({
          anchor: Anchor.TopRight,
          origin: Anchor.TopRight,
        }),
      }));
    }
  }
}
