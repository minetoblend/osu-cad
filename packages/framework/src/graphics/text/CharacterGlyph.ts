import type { ICharacterGlyph } from "./ITexturedCharacterGlyph";
import type { IGlyphStore } from "./IGlyphStore";


export class CharacterGlyph implements ICharacterGlyph
{
  readonly #containingStore?: IGlyphStore;

  public constructor(
    public readonly character: string,
    public readonly xOffset: number,
    public readonly yOffset: number,
    public readonly xAdvance: number,
    public readonly baseline: number,
    containingStore?: IGlyphStore,
  )
  {
    this.#containingStore = containingStore;
  }


  public getKerning(last: ICharacterGlyph): number
  {
    return this.#containingStore?.getKerning(last.character, this.character) ?? 0;
  }
}
