import type { BoundsData, ObservablePoint, Texture } from 'pixi.js';
import { Sprite } from 'pixi.js';

export class OsucadSprite extends Sprite {
  override readonly renderPipeId = 'osucad-sprite';

  protected override updateBounds() {
    updateQuadBounds(this._bounds, this._anchor, this._texture, 0.1, 0.1);
  }
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
    bounds.maxX = bounds.minX + sourceWidth + paddingX;

    bounds.minY = (trim.y) - (anchor._y * height) - paddingY;
    bounds.maxY = bounds.minY + sourceHeight + paddingY;
  }

  else {
    bounds.minX = (-anchor._x * width) - paddingX;
    bounds.maxX = bounds.minX + width + paddingX;

    bounds.minY = (-anchor._y * height) - paddingY;
    bounds.maxY = bounds.minY + height + paddingY;
  }
}
