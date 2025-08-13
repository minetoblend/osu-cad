import { extensions, Rectangle, Texture } from "pixi.js";
import type { IVec2 } from "./math/Vec2";

declare module "pixi.js"
{
  export interface Texture
  {
    withMaximumSize(maxSize: import("./math/Vec2").IVec2): import("pixi.js").Texture;
  }
}


const mixin: Partial<Texture> = {
  withMaximumSize(maxSize: IVec2)
  {
    const texture = this as unknown as Texture;

    if (texture.width <= maxSize.x && texture.height <= maxSize.y)
      return texture;

    const newWidth = Math.min(texture.width, maxSize.x);
    const newHeight = Math.min(texture.height, maxSize.y);

    const orig = new Rectangle(
        texture.orig.x + (texture.width - maxSize.x) / 2,
        texture.orig.y + (texture.height - maxSize.y) / 2,
        newWidth,
        newHeight,
    );

    const frame = new Rectangle(
        texture.frame.x + (texture.width - maxSize.x) / 2,
        texture.frame.y + (texture.height - maxSize.y) / 2,
        newWidth,
        newHeight,
    );

    return new Texture({
      source: this.source,
      orig,
      frame,
    });
  },
} as Texture;

extensions.mixin(Texture, mixin);
