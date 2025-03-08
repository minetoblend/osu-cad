import type { Container, ReadonlyDependencyContainer } from '@osucad/framework';
import { almostEquals, Axes, Bindable, Box, CircularContainer, EasingFunction, RoundedBox } from '@osucad/framework';
import { DrawableSliderBall } from '@osucad/ruleset-osu';
import { Color } from 'pixi.js';
import { FollowCircle } from '../FollowCircle';

export class ArgonFollowCircle extends FollowCircle {
  constructor() {
    super();

    this.#circle = new RoundedBox({
      relativeSizeAxes: Axes.Both,
      blendMode: 'add',
      fillAlpha: 0.3,
      cornerRadius: 100,
      outline: {
        width: 4,
        color: 0xFFFFFF,
      },
    });

    this.internalChild = this.#circleContainer = new CircularContainer({
      relativeSizeAxes: Axes.Both,
      masking: true,
      borderThickness: 4,
      blendMode: 'add',
      child: this.#circleFill = new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0.3,
      }),
    });
  }

  #circle: RoundedBox;
  #circleContainer: Container;
  #circleFill: Box;

  private readonly accentColor = new Bindable(new Color(0xFFFFFF));

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    if (this.parentObject)
      this.accentColor.bindTo(this.parentObject.accentColor);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.accentColor.bindValueChanged((color) => {
      this.#circleFill.color = color.value;
      this.#circleContainer.borderColor = color.value;

      this.#circle.outline = {
        color: color.value.toNumber(),
        width: 4,
        alignment: 0,
      };
      this.#circle.fillColor = color.value;
    }, true);
  }

  protected override onSliderPress(): void {
    const duration = 300;

    if (almostEquals(0, this.alpha))
      this.scaleTo(1);

    this.scaleTo(DrawableSliderBall.FOLLOW_AREA, duration, EasingFunction.OutQuint)
      .fadeIn(duration, EasingFunction.OutQuint);
  }

  protected override onSliderRelease(): void {
    // TODO: fix thisi
    this.onSliderEnd();
  }

  protected override onSliderEnd(): void {
    const duration = 300;

    this.scaleTo(1, duration, EasingFunction.OutQuint)
      .fadeOut(duration / 2, EasingFunction.OutQuint);
  }

  protected override onSliderTick(): void {
    if (this.scale.x >= DrawableSliderBall.FOLLOW_AREA * 0.98) {
      this.scaleTo(DrawableSliderBall.FOLLOW_AREA * 1.08, 40, EasingFunction.OutQuint)
        .then()
        .scaleTo(DrawableSliderBall.FOLLOW_AREA, 200, EasingFunction.OutQuint);
    }
  }

  protected override onSliderBreak() {
  }
}
