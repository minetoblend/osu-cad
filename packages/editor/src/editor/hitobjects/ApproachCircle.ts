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
import type { ColorSource } from 'pixi.js';
import { Skin } from '../../skins/Skin';

export class ApproachCircle extends CompositeDrawable {
  constructor() {
    super();

    this.alwaysPresent = true;
  }

  approachCircle!: DrawableSprite;

  @resolved(Skin)
  skin!: Skin;

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

  set comboColor(value: ColorSource) {
    this.approachCircle.color = value;
  }
}
