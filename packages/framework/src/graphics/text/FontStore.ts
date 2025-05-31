import type { ITexturedCharacterGlyph } from "./ITexturedCharacterGlyph";
import type { ITexturedGlyphLookupStore } from "./ITexturedGlyphLookupStore";

export class FontStore implements ITexturedGlyphLookupStore
{
  get(fontName: string | null, character: string): ITexturedCharacterGlyph | null
  {
    return null;
  }
}
