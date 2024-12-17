import { Axes, Container, dependencyLoader, FastRoundedBox } from 'osucad-framework';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../OsucadColors';
import { TimelineLayer, TimelineLayerHeader } from '../../ui/timeline/TimelineLayer';

export abstract class TimingScreenTimelineLayer extends TimelineLayer {
  protected constructor(
    title: string,
  ) {
    super(title);
  }

  protected override createHeader(): TimelineLayerHeader {
    return new TimingScreenTimelineLayerHeader(this.title, this.layerColor);
  }
}

export class TimingScreenTimelineLayerHeader extends TimelineLayerHeader {
  @dependencyLoader()
  load() {
    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
        cornerRadius: 2,
      }),
      new Container({
        relativeSizeAxes: Axes.Y,
        width: 6,
        padding: { horizontal: 2, vertical: 9 },
        child: new FastRoundedBox({
          relativeSizeAxes: Axes.Both,
          color: this.layerColor,
          cornerRadius: 2,
        }),
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { horizontal: 10, vertical: 7 },
        children: [
          new OsucadSpriteText({
            text: this.title,
            fontSize: 11,
            color: OsucadColors.text,
          }),
        ],
      }),
    );
  }
}
