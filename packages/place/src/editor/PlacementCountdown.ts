import { Anchor, EasingFunction, resolved, VisibilityContainer } from '@osucad/framework';
import { Countdown } from './Countdown';
import { PlaceClient } from './PlaceClient';

export class PlacementCountdown extends VisibilityContainer {
  constructor() {
    super();

    this.anchor = Anchor.BottomCenter;
    this.origin = Anchor.BottomCenter;

    this.alwaysPresent = true;

    this.internalChildren = [
      this.countdown = new Countdown().with({
        anchor: Anchor.BottomCenter,
        origin: Anchor.BottomCenter,
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

      if (evt.value.endTime > this.time.current)
        this.countdown.start(evt.value.endTime, evt.value.totalTime);
    }, true);

    this.countdown.isRunning.bindValueChanged((running) => {
      if (running.value) {
        this.show();
      }
      else {
        this.hide();
      }
    }, true);
  }

  popIn() {
    this.clearTransforms();
    this.moveToY(0, 700, EasingFunction.OutElasticHalf)
      .fadeIn(200);
  }

  popOut() {
    this.clearTransforms();
    this
      .delay(2000)
      .moveToY(100, 700, EasingFunction.InQuad)
      .fadeOut(500);
  }
}
