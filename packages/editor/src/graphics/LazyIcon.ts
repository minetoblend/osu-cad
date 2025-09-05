import type { DrawableOptions } from "@osucad/framework";
import { Anchor, Axes, CompositeDrawable, DrawableSprite, FillMode, loadTexture } from "@osucad/framework";
import type { Texture } from "pixi.js";

export interface LazyIconOptions extends DrawableOptions
{
  url: string
}

const textures = new Map<string, Promise<Texture | null>>();

export class LazyIcon extends CompositeDrawable
{
  public constructor(options: LazyIconOptions)
  {
    super();

    const { url, ...rest } = options;

    this.with(rest);

    void this.#loadIcon(url);
  }

  async #loadIcon(url: string)
  {
    let textureP = textures.get(url);
    if (!textureP)
    {
      textures.set(url, textureP = loadTexture(url));
    }

    const texture = await textureP;

    if (texture)
    {
      this.addInternal(new DrawableSprite({
        texture,
        relativeSizeAxes: Axes.Both,
        fillMode: FillMode.Fit,
        fillAspectRatio: texture.height > 0 ? texture.width / texture.height : 1,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }));
    }
  }
}
