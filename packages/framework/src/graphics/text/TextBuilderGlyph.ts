import type { ICharacterGlyph, ITexturedCharacterGlyph } from "./ITexturedCharacterGlyph";
import { isWhiteSpace } from "./ITexturedCharacterGlyph";
import { Rectangle } from "../../math/Rectangle";

export class TextBuilderGlyph implements ITexturedCharacterGlyph
{
  get texture()
  {
    return this.glyph.texture;
  }

  get xOffset()
  {
    if (this.fixedWidth !== undefined)
      return (this.fixedWidth - this.glyph.width) / 2 * this.textSize;

    return this.glyph.xOffset * this.textSize;
  }

  get xAdvance()
  {
    return (this.fixedWidth ?? this.glyph.xAdvance) * this.textSize;
  }

  get width()
  {
    return this.glyph.width * this.textSize;
  }

  get character()
  {
    return this.glyph.character;
  }

  get yOffset()
  {
    if (this.useFontSizeAsHeight)
      return this.glyph.yOffset * this.textSize;

    return 0;
  }

  get baseline()
  {
    if (this.useFontSizeAsHeight)
      return this.glyph.baseline * this.textSize;

    return (this.glyph.baseline - this.glyph.yOffset) * this.textSize;
  }

  get height()
  {
    if (isWhiteSpace(this.glyph))
      return 0;

    return this.glyph.height * this.textSize;
  }

  drawRectangle = new Rectangle(0, 0, 0, 0);

  linePosition = 0;

  onNewLine = false;

  constructor(readonly glyph: ITexturedCharacterGlyph, readonly textSize: number, readonly fixedWidth?: number, readonly useFontSizeAsHeight: boolean = true)
  {
  }

  getKerning(last: ICharacterGlyph): number
  {
    return this.fixedWidth !== undefined ? 0 : this.glyph.getKerning(last);
  }
}
