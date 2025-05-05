import type { DrawableSpriteOptions } from "../drawables/DrawableSprite";
import { Texture } from "pixi.js";
import { DrawableSprite } from "../drawables/DrawableSprite";

export class Box extends DrawableSprite 
{
  constructor(options: Omit<DrawableSpriteOptions, "texture"> = {}) 
  {
    super({ texture: Texture.WHITE });

    this.with(options);
  }
}
