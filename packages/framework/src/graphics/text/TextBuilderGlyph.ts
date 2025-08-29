import type { ICharacterGlyph, ITexturedCharacterGlyph } from "./ITexturedCharacterGlyph";
import { isWhiteSpace } from "./ITexturedCharacterGlyph";
import { Rectangle } from "../../math/Rectangle";

export class TextBuilderGlyph implements ITexturedCharacterGlyph
{
  public get texture()
  {
    return this.glyph.texture;
  }

  public get xOffset()
  {
    if (this.fixedWidth !== undefined)
      return (this.fixedWidth - this.glyph.width) / 2 * this.textSize;

    return this.glyph.xOffset * this.textSize;
  }

  public get xAdvance()
  {
    return (this.fixedWidth ?? this.glyph.xAdvance) * this.textSize;
  }

  public get width()
  {
    return this.glyph.width * this.textSize;
  }

  public get character()
  {
    return this.glyph.character;
  }

  public get yOffset()
  {
    if (this.useFontSizeAsHeight)
      return this.glyph.yOffset * this.textSize;

    return 0;
  }

  public get baseline()
  {
    if (this.useFontSizeAsHeight)
      return this.glyph.baseline * this.textSize;

    return (this.glyph.baseline - this.glyph.yOffset) * this.textSize;
  }

  public get height()
  {
    if (isWhiteSpace(this.glyph))
      return 0;

    return this.glyph.height * this.textSize;
  }

  public drawRectangle = new Rectangle(0, 0, 0, 0);

  public linePosition = 0;

  public onNewLine = false;

  public constructor(
    public readonly glyph: ITexturedCharacterGlyph,
    public readonly textSize: number,
    public readonly fixedWidth?: number,
    public readonly useFontSizeAsHeight: boolean = true,
  )
  {
  }

  public getKerning(last: ICharacterGlyph): number
  {
    return this.fixedWidth !== undefined ? 0 : this.glyph.getKerning(last);
  }
}
