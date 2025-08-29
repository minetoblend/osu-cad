import { Graphics } from "pixi.js";
import type { LoreAccurateSpriteText } from "./LoreAccurateSpriteText";

export class SpriteTextDrawNode extends Graphics
{
  public constructor(public readonly source: LoreAccurateSpriteText)
  {
    super({});
  }

  public updateGeometry()
  {
    const context = this.context;
    context.clear();

    const characters = this.source.characters;

    for (const character of characters)
    {
      const { drawRectangle, texture } = character;

      context.rect(drawRectangle.x, drawRectangle.y, drawRectangle.width, drawRectangle.height);
      context.texture(
          texture,
          "white",
          drawRectangle.x,
          drawRectangle.y,
          drawRectangle.width,
          drawRectangle.height,
      );
    }
  }
}
