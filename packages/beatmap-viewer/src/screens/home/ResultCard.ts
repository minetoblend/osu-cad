import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { BeatmapSetResponse } from '../../mirrors/BeatmapSetResponse';
import { OsucadColors, OsucadSpriteText } from '@osucad/common';
import { Axes, Container, FastRoundedBox, MaskingContainer } from 'osucad-framework';

export class ResultCard extends MaskingContainer {
  constructor(
    readonly mapset: BeatmapSetResponse,
  ) {
    super();

    // this.anchor = Anchor.TopCenter;
    // this.origin = Anchor.TopCenter;
  }

  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.width = 250;
    this.height = 150;

    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 6,
        color: OsucadColors.translucent,
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: 10,
        children: [
          new OsucadSpriteText({
            text: this.mapset.title,
            color: OsucadColors.text,
          }),
          new OsucadSpriteText({
            text: this.mapset.artist,
            color: OsucadColors.text,
            fontSize: 14,
            alpha: 0.5,
            y: 20,
          }),
        ],
      }),
    );
  }
}
