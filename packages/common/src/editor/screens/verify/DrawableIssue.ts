import type { Container, ReadonlyDependencyContainer } from 'osucad-framework';
import type { Issue } from '../../../verifier/Issue';
import { Anchor, Axes, CompositeDrawable, FillFlowContainer, Vec2 } from 'osucad-framework';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { TextBlock } from '../../../drawables/TextBlock';
import { OsucadColors } from '../../../OsucadColors';
import { arrayify } from '../../../utils/arrayUtils';
import { DrawableTimestamp } from './DrawableTimestamp';

export class DrawableIssue extends CompositeDrawable {
  constructor(readonly issue: Issue) {
    super();
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

    if (this.issue.timestamp) {
      if (typeof this.issue.timestamp === 'number') {
        messageLine.add(new DrawableTimestamp(this.issue.timestamp).with({
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

      for (const word of this.issue.message.split(' ')) {
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
      messageLine.add(new TextBlock({
        text: this.issue.message,
        color: OsucadColors.text,
        fontSize: 13,
      }));
    }
  }
}
