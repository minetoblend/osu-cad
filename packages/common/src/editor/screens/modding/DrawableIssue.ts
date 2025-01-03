import type { Container, ReadonlyDependencyContainer } from 'osucad-framework';
import type { Issue } from '../../../verifier/Issue';
import { Anchor, Axes, CompositeDrawable, Drawable, DrawableSprite, FillFlowContainer, Vec2 } from 'osucad-framework';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../OsucadColors';
import { getIcon } from '../../../OsucadIcons';
import { arrayify } from '../../../utils/arrayUtils';
import { DrawableTimestamp } from './DrawableTimestamp';

export class DrawableIssue extends CompositeDrawable {
  constructor(readonly issue: Issue) {
    super();
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

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    let messageLine: Container;

    this.internalChildren = [
      messageLine = new FillFlowContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        spacing: new Vec2(3),
      }),
    ];

    const icon = this.getIcon();
    console.log(icon);
    if (icon) {
      messageLine.add(new DrawableSprite({
        size: new Vec2(24),
        texture: icon,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }));
    }

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

    for (const part of arrayify(this.issue.message)) {
      if (typeof part === 'string') {
        for (const word of part.split(' ')) {
          messageLine.add(new OsucadSpriteText({
            text: word,
            color: OsucadColors.text,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            fontSize: 13,
          }));
        }
      }
      else {
        messageLine.add(part.with({
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }));
      }
    }
  }
}
