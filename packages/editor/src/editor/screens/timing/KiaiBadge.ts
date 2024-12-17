import { Anchor, Axes, CompositeDrawable, Container, dependencyLoader, FastRoundedBox } from 'osucad-framework';
import { OsucadSpriteText } from '../../../OsucadSpriteText';

export class KiaiBadge extends CompositeDrawable {
  @dependencyLoader()
  load() {
    this.autoSizeAxes = Axes.X;

    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x343440,
        cornerRadius: 4,
      }),
      new Container({
        padding: { horizontal: 4, vertical: 1 },
        autoSizeAxes: Axes.X,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        child: new OsucadSpriteText({
          fontSize: 11,
          fontWeight: 600,
          text: 'kiai',
          color: 0xC842F5,
          anchor: Anchor.CenterLeft,
          origin: Anchor.CenterLeft,
        }),
      }),
    );
  }
}
