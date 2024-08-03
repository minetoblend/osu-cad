import { Axes, CompositeDrawable, Container, FillFlowContainer, dependencyLoader } from 'osucad-framework';
import type { ControlPoint } from '@osucad/common';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox';

export class SampleTypeBadge extends CompositeDrawable {
  constructor(
    readonly controlPoint: ControlPoint,
  ) {
    super();

    this.autoSizeAxes = Axes.Both;
  }

  #text!: OsucadSpriteText;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x343440,
        cornerRadius: 4,
      }),
      new Container({
        padding: { horizontal: 4, vertical: 1 },
        autoSizeAxes: Axes.Both,
        child: new FillFlowContainer({
          autoSizeAxes: Axes.Both,
          spacing: { x: 4, y: 0 },
          children: [
            new OsucadSpriteText({
              fontSize: 10,
              fontWeight: 600,
              text: 'Samplset',
            }),
            this.#text = new OsucadSpriteText({
              fontSize: 11,
              fontWeight: 600,
              text: 'Normal',
              color: 'ffb12b',
            }),
          ],
        }),
      }),
    );
  }
}
