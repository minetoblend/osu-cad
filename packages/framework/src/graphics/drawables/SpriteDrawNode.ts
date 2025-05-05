import type { BoundsData, Texture } from "pixi.js";
import type { DrawableSprite } from "./DrawableSprite";
import { Sprite } from "pixi.js";

export class SpriteDrawNode extends Sprite
{
  constructor(readonly source: DrawableSprite)
  {
    super();
  }

  override renderPipeId = "osucad-sprite";

  protected override updateBounds()
  {
    updateQuadBounds(this._bounds, this._texture);
  }
}

export function updateQuadBounds(
  bounds: BoundsData,
  texture: Texture,
)
{
  const { width, height } = texture.orig;
  const trim = texture.trim;

  if (trim)
  {
    const sourceWidth = trim.width;
    const sourceHeight = trim.height;

    bounds.minX = trim.x;
    bounds.maxX = bounds.minX + sourceWidth;

    bounds.minY = trim.y;
    bounds.maxY = bounds.minY + sourceHeight;
  }

  else
  {
    bounds.minX = 0;
    bounds.maxX = bounds.minX + width;

    bounds.minY = 0;
    bounds.maxY = bounds.minY + height;
  }
}
