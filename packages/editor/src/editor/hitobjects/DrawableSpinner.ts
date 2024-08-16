import type { Spinner } from '@osucad/common';
import { Anchor, Container, DrawableSprite, resolved } from 'osucad-framework';
import { Skin } from '../../skins/Skin';
import { animate } from '../../utils/animate';
import { DrawableHitObject } from './DrawableHitObject';

export class DrawableSpinner extends DrawableHitObject<Spinner> {
  @resolved(Skin)
  skin!: Skin;

  load() {
    super.load();

    this.addInternal(this.#content = new Container());

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.addAll(
      this.bottom = new DrawableSprite({
        texture: this.skin.spinnerBottom,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        alpha: 0.8,
      }),
      this.middle = new DrawableSprite({
        texture: this.skin.spinnerMiddle,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.top = new DrawableSprite({
        texture: this.skin.spinnerTop,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );
  }

  bottom!: DrawableSprite;
  middle!: DrawableSprite;
  top!: DrawableSprite;

  #content!: Container;

  get content() {
    return this.#content;
  }

  setup() {
    this.scale = 0.6;
  }

  currentRotation = 0;

  update() {
    super.update();

    const timeSinceStart
      = this.time.current - this.hitObject.startTime;

    const spinUpTime = Math.min(750, this.hitObject.duration * 0.666);
    const spinDownTime = Math.min(350, this.hitObject.duration * 0.333);

    let spinSpeed = 0;

    if (timeSinceStart < 0) {
      this.#content.alpha = animate(timeSinceStart, -this.hitObject.timePreempt, -this.hitObject.timePreempt + this.hitObject.timeFadeIn, 0, 1);
    }
    else if (timeSinceStart < spinUpTime) {
      spinSpeed = (timeSinceStart / spinUpTime) ** 2;
      this.#content.alpha = 1;
    }
    else if (timeSinceStart > this.hitObject.duration) {
      this.#content.alpha = animate(
        timeSinceStart,
        this.hitObject.duration,
        this.hitObject.duration + spinDownTime,
        1,
        0,
      );
      spinSpeed = ((this.hitObject.duration - timeSinceStart + spinDownTime) / spinDownTime) ** 2;
    }
    else if (timeSinceStart < this.hitObject.duration) {
      spinSpeed = 1;
      this.#content.alpha = 1;
    }
    spinSpeed *= 2.5;

    const rotationDelta = spinSpeed * this.time.elapsed * 0.0125;

    this.currentRotation += rotationDelta;

    this.top.rotation = this.currentRotation;
    this.bottom.rotation = this.currentRotation * 0.25;
  }
}
