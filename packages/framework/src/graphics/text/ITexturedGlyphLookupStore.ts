import type { ITexturedCharacterGlyph } from "./ITexturedCharacterGlyph";

export interface ITexturedGlyphLookupStore
{
  get(fontName: string | null, character: string): ITexturedCharacterGlyph | null
}
