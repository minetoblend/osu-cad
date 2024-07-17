import { Axes, CompositeDrawable, Container, RoundedBox } from 'osucad-framework';
import { OsucadSpriteText } from '../OsucadSpriteText';

export class BeatmapVersionBadge extends CompositeDrawable {
  constructor(version: string) {
    super();

    this.autoSizeAxes = Axes.Both;

    this.addAllInternal(
      new RoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
        color: 0x52CCA3,
      }),
      new Container({
        padding: { horizontal: 6, vertical: 1 },
        autoSizeAxes: Axes.Both,
        child: new OsucadSpriteText({
          text: version,
          fontSize: 11,
        }),
      }),
    );
  }
}
