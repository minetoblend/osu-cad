import type {
  Color,
} from 'osucad-framework';
import {
  Anchor,
  CompositeDrawable,
  DrawableSprite,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Skin } from '../../skins/Skin';
import { animate } from '../../utils/animate';
import { PreferencesStore } from '../../preferences/PreferencesStore';

export class ApproachCircle extends CompositeDrawable {
  constructor() {
    super();

    this.alpha = 0;
    this.alwaysPresent = true;
  }

  approachCircle!: DrawableSprite;

  timePreempt = 0;
  startTime = 0;

  @resolved(Skin)
  skin!: Skin;

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  @dependencyLoader()
  load() {
    this.addInternal(
      (this.approachCircle = new DrawableSprite({
        texture: this.skin.approachCircle,
        origin: Anchor.Center,
        anchor: Anchor.Center,
      })),
    );
  }

  get comboColor(): Color {
    return this.approachCircle.color;
  }

  set comboColor(value: number) {
    this.approachCircle.color = value;
  }

  update() {
    super.update();

    const time = this.time.current - this.startTime;
    if (time < 0) {
      this.scale = animate(time, -this.timePreempt, 0, 4, 1);
      this.alpha = animate(time, -this.timePreempt, 0, 0, 1);
    }
    else {
      this.scale
      = this.preferences.viewport.hitAnimations
          ? 0
          : animate(time, 0, 100, 1, 1.1);
      this.alpha = animate(time, 0, 700, 1, 0);
    }
  }
}
