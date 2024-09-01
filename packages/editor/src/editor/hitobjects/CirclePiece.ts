import {
  Anchor,
  Container,
  DrawableSprite,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import type { Color, ColorSource } from 'pixi.js';
import { PreferencesStore } from '../../preferences/PreferencesStore';
import { Skin } from '../../skins/Skin';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { DrawableComboNumber } from './DrawableComboNumber';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';

export class CirclePiece extends Container {
  constructor(
    protected readonly hasNumber = true,
  ) {
    super({
      size: OsuHitObject.object_dimensions,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    });
  }

  @resolved(Skin)
  private skin!: Skin;

  @resolved(PreferencesStore)
  private preferences!: PreferencesStore;

  @resolved(DrawableOsuHitObject)
  private drawableHitObject!: DrawableOsuHitObject<any>;

  protected circleSprite!: DrawableSprite;
  protected overlaySprite!: DrawableSprite;

  get comboColor(): Color {
    return this.circleSprite.color;
  }

  set comboColor(color: ColorSource) {
    this.circleSprite.color = color;
  }

  @dependencyLoader()
  load() {
    this.addAllInternal(
      (this.circleSprite = new DrawableSprite({
        texture: this.skin.hitcircle,
        origin: Anchor.Center,
        anchor: Anchor.Center,
      })),
      (this.overlaySprite = new DrawableSprite({
        texture: this.skin.hitcircleOverlay,
        origin: Anchor.Center,
        anchor: Anchor.Center,
      })),
    );

    if (this.hasNumber) {
      const comboNumber = new DrawableComboNumber();

      this.addInternal(comboNumber);

      this.drawableHitObject.indexInComboBindable.addOnChangeListener((e) => {
        comboNumber.comboNumber = e.value + 1;
      }, { immediate: true });
    }
  }
}
