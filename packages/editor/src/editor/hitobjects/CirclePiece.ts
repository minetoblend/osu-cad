import {
  Anchor,
  Container,
  DrawableSprite,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Easing } from 'osu-classes';
import { PreferencesStore } from '../../preferences/PreferencesStore';
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

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

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

    const hitAnimationsEnabled = this.preferences.viewport.hitAnimations;

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
      this.scale = 1;
    }
    else {
      this.alpha
        = hitAnimationsEnabled
          ? animate(time, 0, 240, 0.9, 0)
          : animate(time, 0, 700, 0.9, 0, Easing.inQuad);

      this.scale
        = hitAnimationsEnabled
          ? animate(time, 0, 240, 1, 1.4)
          : 1;

      this.hitCircle.color = 0xFFFFFF;
    }
  }
}
