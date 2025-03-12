import { OsucadColors, OsucadSpriteText } from '@osucad/core';
import { Anchor, Axes, FillFlowContainer, resolved, Vec2 } from '@osucad/framework';
import { Countdown } from './Countdown';
import { PlaceClient } from './PlaceClient';

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

  @resolved(PlaceClient)
  client!: PlaceClient;

  countdown!: Countdown;

  protected loadComplete() {
    super.loadComplete();

    this.client.countdownEndTime.bindValueChanged((evt) => {
      if (!evt.value)
        return;

      this.countdown.start(evt.value.endTime, evt.value.totalTime);
    }, true);
  }
}
