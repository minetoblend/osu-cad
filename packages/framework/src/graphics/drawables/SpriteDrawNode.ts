import type { BoundsData, Texture } from 'pixi.js';
import type { DrawableSprite } from './DrawableSprite';
import { Sprite } from 'pixi.js';

export class SpriteDrawNode extends Sprite {
  constructor(readonly source: DrawableSprite) {
    super();
  }

  override renderPipeId = 'osucad-sprite';

  protected override updateBounds() {
    updateQuadBounds(this._bounds, this._texture, 0, 0);
  }
}

export function updateQuadBounds(
  bounds: BoundsData,
  texture: Texture,
  paddingX: number,
  paddingY: number,
) {
  const { width, height } = texture.orig;
  const trim = texture.trim;

  if (trim) {
    const sourceWidth = trim.width;
    const sourceHeight = trim.height;

    bounds.minX = (trim.x) - paddingX;
    bounds.maxX = bounds.minX + sourceWidth + paddingX * 2;

    bounds.minY = (trim.y) - paddingY;
    bounds.maxY = bounds.minY + sourceHeight + paddingY * 2;
  }

  else {
    bounds.minX = -paddingX;
    bounds.maxX = bounds.minX + width + paddingX * 2;

    bounds.minY = -paddingY;
    bounds.maxY = bounds.minY + height + paddingY * 2;
  }
}
