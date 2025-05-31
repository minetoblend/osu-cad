import type { Texture } from "pixi.js";
import type { ICharacterGlyph, ITexturedCharacterGlyph } from "./ITexturedCharacterGlyph";
import type { CharacterGlyph } from "./CharacterGlyph";

export class TexturedCharacterGlyph implements ITexturedCharacterGlyph
{
  get xOffset(): number
  {
    return this.glyph.xOffset * this.scale;
  }

  get yOffset(): number
  {
    return this.glyph.yOffset * this.scale;
  }

  get xAdvance(): number
  {
    return this.glyph.xAdvance * this.scale;
  }

  get baseline(): number
  {
    return this.glyph.baseline * this.scale;
  }

  get character(): string
  {
    return this.glyph.character;
  }

  get width(): number
  {
    return this.texture.width * this.scale;
  }

  get height(): number
  {
    return this.texture.height * this.scale;
  }

  constructor(readonly glyph: CharacterGlyph, readonly texture: Texture, readonly scale: number = 1)
  {
  }

  getKerning(last: ICharacterGlyph): number
  {
    return this.glyph.getKerning(last);
  }
}
