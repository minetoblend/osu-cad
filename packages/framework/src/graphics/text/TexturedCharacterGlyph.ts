import type { Texture } from "pixi.js";
import type { ICharacterGlyph, ITexturedCharacterGlyph } from "./ITexturedCharacterGlyph";
import type { CharacterGlyph } from "./CharacterGlyph";

export class TexturedCharacterGlyph implements ITexturedCharacterGlyph
{
  public get xOffset(): number
  {
    return this.glyph.xOffset * this.scale;
  }

  public get yOffset(): number
  {
    return this.glyph.yOffset * this.scale;
  }

  public get xAdvance(): number
  {
    return this.glyph.xAdvance * this.scale;
  }

  public get baseline(): number
  {
    return this.glyph.baseline * this.scale;
  }

  public get character(): string
  {
    return this.glyph.character;
  }

  public get width(): number
  {
    return this.texture.width * this.scale;
  }

  public get height(): number
  {
    return this.texture.height * this.scale;
  }

  public constructor(
    public readonly glyph: CharacterGlyph,
    public readonly texture: Texture,
    public readonly scale: number = 1,
  )
  {
  }

  public getKerning(last: ICharacterGlyph): number
  {
    return this.glyph.getKerning(last);
  }
}
