import type { ReadonlyDependencyContainer, ScheduledDelegate } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, EasingFunction } from 'osucad-framework';
import { CircleSegment } from '../../framework/src/graphics/shapes/CircleSegment';
import { TouchSource } from '../../framework/src/input/handlers/Touch';

export class LongPressOverlay extends CompositeDrawable {
  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
    this.relativeSizeAxes = Axes.Both;

    this.addInternal(this.circleSegment);
  }

  protected loadComplete() {
    super.loadComplete();

    const inputManager = this.getContainingInputManager();

    const delay = 100;

    inputManager!.touchLongPressBegan.addListener(([position, duration]) => {
      this.#longPressDelegate?.cancel();

      this.#longPressDelegate = this.scheduler.addDelayed(() => {
        this.#active = true;

        this.circleSegment.position = this.toLocalSpace(position);

        this.circleSegment.endAngle = 0;
        this.circleSegment
          .fadeOut()
          .fadeTo(0.5, duration - delay, EasingFunction.InQuad)
          .transformTo('endAngle', Math.PI * 2, duration - delay, EasingFunction.InQuad)
          .then()
          .fadeOut(200, EasingFunction.OutQuad);
      }, delay);
    });

    inputManager!.touchLongPressCancelled.addListener(() => {
      this.#longPressDelegate?.cancel();
      this.circleSegment.clearTransforms();
      this.circleSegment.hide();
      this.#active = false;
    });
  }

  #longPressDelegate?: ScheduledDelegate;

  circleSegment = new CircleSegment({
    size: 80,
    origin: Anchor.Center,
    startAngle: 0,
    endAngle: 0,
    hollowness: 0.8,
    rotation: Math.PI / 2,
    alpha: 0,
  });

  #active = true;

  updateAfterChildren() {
    super.updateAfterChildren();

    if (this.#active && this.getContainingInputManager()!.getTouchButtonEventManagerFor(TouchSource.Touch1).touchDownPosition === null) {
      this.#active = false;
    }
  }
}
