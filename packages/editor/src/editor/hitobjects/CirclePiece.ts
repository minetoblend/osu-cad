import {
  Anchor,
  Container,
  DrawableSprite,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Skin } from '../../skins/Skin';
import { animate } from '../../utils/animate';

export class CirclePiece extends Container {
  constructor() {
    super();

    this.alpha = 0;
    this.alwaysPresent = true;
  }

  @resolved(Skin)
  skin!: Skin;

  hitCircle!: DrawableSprite;
  hitCircleOverlay!: DrawableSprite;

  startTime = 0;
  timePreempt = 0;
  timeFadeIn = 0;

  comboColor = 0xFFFFFF;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      (this.hitCircle = new DrawableSprite({
        texture: this.skin.hitcircle,
        origin: Anchor.Center,
        anchor: Anchor.Center,
      })),
      (this.hitCircleOverlay = new DrawableSprite({
        texture: this.skin.hitcircleOverlay,
        origin: Anchor.Center,
        anchor: Anchor.Center,
      })),
    );
  }

  update() {
    super.update();

    const time = this.time.current - this.startTime;
    if (time < 0) {
      this.alpha = animate(
        time,
        -this.timePreempt,
        -this.timePreempt + this.timeFadeIn,
        0,
        1,
      );
      this.hitCircle.color = this.comboColor;
    }
    else {
      this.alpha = animate(time, 0, 700, 0.9, 0, x => x ** 4);
      this.hitCircle.color = 0xFFFFFF;
    }
  }
}
