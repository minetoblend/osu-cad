import type { ISkin } from "@osucad/core";
import { CharacterGlyph, TexturedCharacterGlyph, type ITexturedCharacterGlyph, type ITexturedGlyphLookupStore, type Vec2 } from "@osucad/framework";

export class LegacyGlyphStore implements ITexturedGlyphLookupStore
{
  readonly #skin: ISkin;
  readonly #maxSize: Vec2 | null;

  readonly #fontName: string;

  readonly #cache = new Map<string, ITexturedCharacterGlyph | null>();

  constructor(fontName: string, skin: ISkin, maxSize: Vec2 | null)
  {
    this.#fontName = fontName;
    this.#skin = skin;
    this.#maxSize = maxSize;
  }


  get(fontName: string | null, character: string): ITexturedCharacterGlyph | null
  {
    if (fontName !== this.#fontName)
      return null;

    const cached = this.#cache.get(character);
    // note: null can be cached here so only undefined means it's not cached
    if (cached !== undefined)
      return cached;

    const lookup = this.#getLookupName(character);

    let texture = this.#skin.getTexture(`${fontName}-${lookup}`);

    let glyph: ITexturedCharacterGlyph | null = null;

    if (texture !== null)
    {
      if (this.#maxSize !== null)
        texture = texture.withMaximumSize(this.#maxSize);

      glyph = new TexturedCharacterGlyph(new CharacterGlyph(character, 0, 0, texture!.width, 0), texture!, 1);
    }

    this.#cache.set(character, glyph);
    return glyph;
  }

  #getLookupName(character: string)
  {
    switch (character)
    {
    case ",":
      return "comma";
    case ".":
      return "dot";
    case "%":
      return "percent";
    default:
      return character;
    }
  }
}
