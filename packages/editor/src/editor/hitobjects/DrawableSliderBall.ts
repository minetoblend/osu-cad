import {
  Anchor,
  CompositeDrawable,
  DrawableSprite,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Skin } from '../../skins/Skin';
import { animate } from '../../utils/animate';

export class DrawableSliderBall extends CompositeDrawable {
  constructor() {
    super();
    this.alwaysPresent = true;
  }

  @resolved(Skin)
  skin!: Skin;

  #followCircle!: DrawableSprite;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      (this.#followCircle = new DrawableSprite({
        texture: this.skin.sliderFollowCircle,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      })),
    );
  }

  startTime = 0;
  endTime = 0;

  update(): void {
    super.update();

    const time = this.time.current - this.startTime;
    const duration = this.endTime - this.startTime;

    const fadeDuration = Math.min(150, duration);

    this.alpha = time > 0 && time < duration + fadeDuration ? 1 : 0;
    if (time < fadeDuration) {
      this.#followCircle.scale = animate(time, 0, fadeDuration, 0.5, 1);
      this.#followCircle.alpha = animate(time, 0, fadeDuration, 0.5, 1);
    } else if (time < duration) {
      this.#followCircle.scale = 1;
      this.#followCircle.alpha = 1;
    } else {
      this.#followCircle.scale = animate(
        time,
        duration,
        duration + fadeDuration,
        1,
        0.5,
      );
      this.#followCircle.alpha = animate(
        time,
        duration,
        duration + fadeDuration,
        1,
        0,
      );
    }
  }
}
