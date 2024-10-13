import type { Drawable, Vec2 } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable } from 'osucad-framework';
import { FastRoundedBox } from '../../../../drawables/FastRoundedBox';

export class MovementPathSegment extends CompositeDrawable {
  constructor(
    readonly startPosition: Vec2,
    readonly endPosition: Vec2,
    readonly startTime: number,
    readonly endTime: number,
  ) {
    super();

    if (startPosition.equals(endPosition)) {
      this.lifetimeEnd = Number.MIN_VALUE;
      return;
    }

    this.width = startPosition.distance(endPosition);
    this.height = 2;
    this.origin = Anchor.CenterLeft;

    this.position = startPosition;
    this.rotation = endPosition.sub(startPosition).angle();

    this.padding = { horizontal: -1 };

    this.addAllInternal(
      this.#background = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.X,
        cornerRadius: 1,
        alpha: 0.5,
      }),
      this.#foreground = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.X,
        cornerRadius: 1,
        color: 0xFF0000,
        width: 0,
      }),
    );

    this.alpha = 0;
  }

  #background!: Drawable;

  #foreground!: Drawable;

  protected loadComplete() {
    super.loadComplete();

    const duration = this.endTime - this.startTime;

    if (!Number.isFinite(duration) || duration <= 0) {
      this.hide();
      this.expire();
      return;
    }

    this.absoluteSequence({ time: this.startTime - 700, recursive: true }, () => {
      this.fadeInFromZero(700);

      this.#background
        .moveToX(0)
        .resizeWidthTo(0)
        .resizeWidthTo(1, duration);

      this.#foreground.moveToX(0);
    });

    this.#foreground.absoluteSequence(this.startTime, () =>
      this.#foreground.resizeWidthTo(0).resizeWidthTo(1, duration));

    this.absoluteSequence(this.endTime, () => {
      this.fadeOut(400);
    });

    this.absoluteSequence({ time: this.endTime + 200, recursive: true }, () => {
      const fadeOutDuration = Math.min(duration, 400);

      this.#foreground
        .moveToX(1, fadeOutDuration)
        .resizeWidthTo(0, fadeOutDuration);
      this.#background
        .moveToX(1, fadeOutDuration)
        .resizeWidthTo(0, fadeOutDuration);
    });
  }
}
