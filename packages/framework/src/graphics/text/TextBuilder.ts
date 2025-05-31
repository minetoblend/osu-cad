import { Vec2 } from "../../math/Vec2";
import { TextBuilderGlyph } from "./TextBuilderGlyph";
import type { ITexturedGlyphLookupStore } from "./ITexturedGlyphLookupStore";
import type { FontUsage } from "./FontUsage";
import type { ITexturedCharacterGlyph } from "./ITexturedCharacterGlyph";
import { isWhiteSpace } from "./ITexturedCharacterGlyph";
import { Rectangle } from "../../math/Rectangle";
import { CachedValue } from "../../caching/Cached";

export class TextBuilder
{
  #bounds = new Vec2();

  get bounds(): Vec2
  {
    return this.#bounds;
  }

  readonly characters: TextBuilderGlyph[] = [];

  readonly #neverFixedWidthCharacters: string[];
  readonly #fallbackCharacter: string;
  readonly #fixedWidthReferenceCharacter: string;
  readonly #store: ITexturedGlyphLookupStore;
  readonly #font: FontUsage;
  readonly #useFontSizeAsHeight: boolean;
  readonly #startOffset: Vec2;
  readonly #spacing: Vec2;
  readonly #maxWidth: number;

  #currentPos: Vec2;
  #currentLineHeight = 0;
  #currentLineBase: number | null = null;
  #currentNewLine = true;

  get lineBaseHeight()
  {
    if (this.#currentPos.y > this.#startOffset.y)
      throw new Error("Cannot return a lineBaseHeight from a text builder with multiple lines.");

    return this.#currentLineBase ?? 0;
  }

  constructor(
    store: ITexturedGlyphLookupStore,
    font: FontUsage,
    maxWidth: number = Number.MAX_VALUE,
    useFontSizeAsHeight: boolean = true,
    startOffset: Vec2 = Vec2.zero(),
    spacing: Vec2 = Vec2.zero(),
    characterList: TextBuilderGlyph[] | null = null,
    neverFixedWidthCharacters: string[] | null = null,
    fallbackCharacter: string = "?",
    fixedWidthReferenceCharacter: string = "m",
  )
  {
    this.#store = store;
    this.#font = font;
    this.#useFontSizeAsHeight = useFontSizeAsHeight;
    this.#startOffset = startOffset;
    this.#spacing = spacing;
    this.#maxWidth = maxWidth;

    this.characters = characterList ?? [];
    this.#neverFixedWidthCharacters = neverFixedWidthCharacters ?? [];
    this.#fallbackCharacter = fallbackCharacter;
    this.#fixedWidthReferenceCharacter = fixedWidthReferenceCharacter;

    this.#currentPos = startOffset.clone();
  }

  public reset()
  {
    this.#bounds = Vec2.zero();
    this.characters.length = 0;

    this.#currentPos = this.#startOffset.clone();
    this.#currentLineBase = null;
    this.#currentLineHeight = 0;
    this.#currentNewLine = true;
  }

  protected get canAddCharacters(): boolean
  {
    return true;
  }

  public addText(text: string)
  {
    for (const c of text)
    {
      if (!this.addCharacter(c))
        break;
    }
  }

  public addCharacter(character: string): boolean
  {
    if (!this.canAddCharacters)
      return false;

    const glyph = this.#tryCreateGlyph(character);

    if (!glyph)
      return true;

    let kerning = 0;

    if (!this.#currentNewLine)
    {
      if (this.characters.length > 0)
        kerning = glyph.getKerning(this.characters[this.characters.length - 1].glyph);
      kerning += this.#spacing.x;
    }

    if (!this.hasAvailableSpace(kerning + glyph.xAdvance))
    {
      this.onWidthExceeded();

      if (!this.canAddCharacters)
        return false;
    }

    this.#currentPos.x += kerning;

    glyph.drawRectangle = new Rectangle(this.#currentPos.x + glyph.xOffset, this.#currentPos.y + glyph.yOffset, glyph.width, glyph.height);
    glyph.linePosition = this.#currentPos.y;
    glyph.onNewLine = this.#currentNewLine;

    if (!isWhiteSpace(glyph))
    {
      if (glyph.baseline > (this.#currentLineBase ?? 0))
      {
        for (let i = this.characters.length - 1; i >= 0; i--)
        {
          const previous = this.characters[i];
          previous.drawRectangle.offset(0, glyph.baseline - (this.#currentLineBase ?? 0));
          this.characters[i] = previous;

          this.#currentLineHeight = Math.max(this.#currentLineHeight, previous.drawRectangle.bottom - previous.linePosition);

          if (previous.onNewLine)
            break;
        }
      }
      else if (glyph.baseline < (this.#currentLineBase ?? 0))
      {
        glyph.drawRectangle.offset(0, (this.#currentLineBase ?? 0) - glyph.baseline);
        this.#currentLineHeight = Math.max(this.#currentLineHeight, glyph.drawRectangle.bottom - glyph.linePosition);
      }

      this.#currentLineHeight = Math.max(this.#currentLineHeight, this.#useFontSizeAsHeight ? this.#font.size : glyph.height);
      this.#currentLineBase = this.#currentLineBase === null ? glyph.baseline : Math.max(this.#currentLineBase ?? 0, glyph.baseline);
    }

    this.characters.push(glyph);

    this.#currentPos.x += glyph.xAdvance;
    this.#currentNewLine = false;

    this.#bounds = this.bounds.componentMax(this.#currentPos.add({ x: 0, y: this.#currentLineHeight }));
    return true;
  }

  addNewLine()
  {
    if (this.#currentNewLine)
      this.#currentLineHeight = this.#font.size;

    // Reset + vertically offset the current position
    this.#currentPos.x = this.#startOffset.x;
    this.#currentPos.y += this.#currentLineHeight + this.#spacing.y;

    this.#currentLineBase = null;
    this.#currentLineHeight = 0;
    this.#currentNewLine = true;
  }

  protected onWidthExceeded()
  {
  }

  protected hasAvailableSpace(length: number)
  {
    return this.#currentPos.x + length <= this.#maxWidth;
  }

  readonly #constantWidthCache = new CachedValue<number>();

  #getConstantWidth()
  {
    return this.#constantWidthCache.isValid ? this.#constantWidthCache.value : this.#constantWidthCache.value = this.#getTexturedGlyph(this.#fixedWidthReferenceCharacter)?.width ?? 0;
  }

  #tryCreateGlyph(character: string): TextBuilderGlyph | null
  {
    const fontStoreGlyph = this.#getTexturedGlyph(character);

    if (fontStoreGlyph === null)
      return null;

    if (this.#font.fixedWidth && this.#neverFixedWidthCharacters.indexOf(character) === -1)
      return new TextBuilderGlyph(fontStoreGlyph, this.#font.size, this.#getConstantWidth(), this.#useFontSizeAsHeight);
    else
      return new TextBuilderGlyph(fontStoreGlyph, this.#font.size, undefined, this.#useFontSizeAsHeight);
  }

  #getTexturedGlyph(character: string): ITexturedCharacterGlyph | null
  {
    return this.#store.get(this.#font.fontName, character)
        ?? this.#store.get("", character)
        ?? this.#store.get(this.#font.fontName, this.#fallbackCharacter)
        ?? this.#store.get("", this.#fallbackCharacter);
  }
}
