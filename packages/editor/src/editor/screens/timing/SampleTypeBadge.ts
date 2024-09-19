import type { ControlPoint } from '@osucad/common';
import { Axes, CompositeDrawable, Container, dependencyLoader, FillFlowContainer } from 'osucad-framework';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox';
import { OsucadSpriteText } from '../../../OsucadSpriteText';

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
