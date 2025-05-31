import type { ICharacterGlyph } from "./ITexturedCharacterGlyph";
import type { IGlyphStore } from "./IGlyphStore";


export class CharacterGlyph implements ICharacterGlyph
{
  readonly #containingStore?: IGlyphStore;

  constructor(
    readonly character: string,
    readonly xOffset: number,
    readonly yOffset: number,
    readonly xAdvance: number,
    readonly baseline: number,
    containingStore?: IGlyphStore,
  )
  {
    this.#containingStore = containingStore;
  }


  getKerning(last: ICharacterGlyph): number
  {
    return this.#containingStore?.getKerning(last.character, this.character) ?? 0;
  }

}
