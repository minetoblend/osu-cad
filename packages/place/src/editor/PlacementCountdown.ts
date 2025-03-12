import { OsucadColors, OsucadSpriteText } from '@osucad/core';
import { Anchor, Axes, FillFlowContainer, Vec2 } from '@osucad/framework';
import { Countdown } from './Countdown';

export class PlacementCountdown extends FillFlowContainer {
  constructor() {
    super({
      autoSizeAxes: Axes.Both,
      spacing: new Vec2(10),
      anchor: Anchor.BottomRight,
      origin: Anchor.BottomRight,
      padding: 20,
    });

    this.children = [
      new OsucadSpriteText({
        text: 'You can place the next object in ',
        color: OsucadColors.text,
        fontWeight: 600,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
      this.countdown = new Countdown().with({
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
      }),
    ];
  }

  countdown!: Countdown;
}
