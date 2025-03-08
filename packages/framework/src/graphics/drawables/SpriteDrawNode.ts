import type { DrawableSprite } from './DrawableSprite';
import { type BoundsData, type ObservablePoint, Sprite, type Texture } from 'pixi.js';

export class SpriteDrawNode extends Sprite {
  constructor(readonly source: DrawableSprite) {
    super();
  }

  override renderPipeId = 'osucad-sprite';

  // protected override updateBounds() {
  //   updateQuadBounds(this._bounds, this._anchor, this._texture, 1, 1);
  // }
}

export function updateQuadBounds(
  bounds: BoundsData,
  anchor: ObservablePoint,
  texture: Texture,
  paddingX: number,
  paddingY: number,
) {
  const { width, height } = texture.orig;
  const trim = texture.trim;

  if (trim) {
    const sourceWidth = trim.width;
    const sourceHeight = trim.height;

    bounds.minX = (trim.x) - (anchor._x * width) - paddingX;
    bounds.maxX = bounds.minX + sourceWidth + paddingX * 2;

    bounds.minY = (trim.y) - (anchor._y * height) - paddingY;
    bounds.maxY = bounds.minY + sourceHeight + paddingY * 2;
  }

  else {
    bounds.minX = (-anchor._x * width) - paddingX;
    bounds.maxX = bounds.minX + width + paddingX * 2;

    bounds.minY = (-anchor._y * height) - paddingY;
    bounds.maxY = bounds.minY + height + paddingY * 2;
  }
}
