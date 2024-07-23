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

export class CirclePiece extends Container {
  @resolved(Skin)
  skin!: Skin;

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  hitCircle!: DrawableSprite;
  hitCircleOverlay!: DrawableSprite;

  startTime = 0;
  timePreempt = 0;
  timeFadeIn = 0;

  get comboColor(): Color {
    return this.hitCircle.color;
  }

  set comboColor(color: ColorSource) {
    this.hitCircle.color = color;
  }

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
}
