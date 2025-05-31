import type { DrawableOptions, ITexturedGlyphLookupStore, ReadonlyDependencyContainer, TextBuilder } from "@osucad/framework";
import { FontUsage, LoreAccurateSpriteText, Vec2 } from "@osucad/framework";
import { LegacyFont } from "./LegacyFont";
import { LegacyGlyphStore } from "./LegacyGlyphStore";
import type { ISkin } from "@osucad/core";
import { ISkinSource } from "@osucad/core";

export interface LegacySpriteTextOptions extends DrawableOptions
{
  font: LegacyFont
  text?: string
  fixedWidth?: boolean
  maxSizePerGlyph?: Vec2
}

export class LegacySpriteText extends LoreAccurateSpriteText
{
  private static readonly fixedWidthExcludeCharacters = [",", ".", "%", "x"];

  readonly maxSizePerGlyph: Vec2 | null;

  readonly fixedWidth: boolean;

  readonly #font: LegacyFont;

  #glyphStore!: LegacyGlyphStore;

  protected override get fixedWidthReferenceCharacter(): string
  {
    return "5";
  }

  protected override get fixedWidthExcludeCharacters(): string[] | null
  {
    return LegacySpriteText.fixedWidthExcludeCharacters;
  }

  constructor(options: LegacySpriteTextOptions)
  {
    super();

    const { maxSizePerGlyph, fixedWidth, font, ...rest } = options;

    this.#font = font;
    this.useFullGlyphHeight = false;

    this.maxSizePerGlyph = maxSizePerGlyph ?? null;
    this.fixedWidth = fixedWidth ?? false;

    this.with(rest);
  }

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    const skin = dependencies.resolve(ISkinSource);

    const fontPrefix = getFontPrefix(skin, this.#font);

    super.font = new FontUsage(fontPrefix, { size: 1, fixedWidth: this.fixedWidth });
    this.spacing = new Vec2(-getFontOverlap(skin, this.#font));

    this.#glyphStore = new LegacyGlyphStore(fontPrefix, skin, this.maxSizePerGlyph);
  }

  protected override createTextBuilder(store: ITexturedGlyphLookupStore): TextBuilder
  {
    return super.createTextBuilder(this.#glyphStore);
  }
}

export function getFontPrefix(source: ISkin, font: LegacyFont)
{
  switch (font)
  {
  case LegacyFont.Score:
    return source.getConfig("scorePrefix") ?? "score";
  case LegacyFont.Combo:
    return source.getConfig("comboPrefix") ?? "score";
  case LegacyFont.HitCircle:
    return source.getConfig("hitCirclePrefix") ?? "default";
  }
}

export function getFontOverlap(source: ISkin, font: LegacyFont): number
{
  switch (font)
  {
  case LegacyFont.Score:
    return source.getConfig("scoreOverlap") ?? 0;
  case LegacyFont.Combo:
    return source.getConfig("comboOverlap") ?? 0;
  case LegacyFont.HitCircle:
    return source.getConfig("hitCircleOverlap") ?? 0;
  }
}
