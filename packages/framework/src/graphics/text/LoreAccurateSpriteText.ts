import type { Container } from "pixi.js";
import { FontStore } from "./FontStore";
import { resolved } from "../../di/decorators";
import { Drawable, Invalidation, InvalidationSource } from "../drawables/Drawable";
import { FontUsage } from "./FontUsage";
import { Axes } from "../drawables/Axes";
import type { IVec2 } from "../../math/Vec2";
import { Vec2 } from "../../math/Vec2";
import { MarginPadding, type MarginPaddingOptions } from "../drawables/MarginPadding";
import { LayoutMember } from "../drawables/LayoutMember";
import type { TextBuilderGlyph } from "./TextBuilderGlyph";
import { TextBuilder } from "./TextBuilder";
import type { ITexturedGlyphLookupStore } from "./ITexturedGlyphLookupStore";
import { LayoutValue } from "../drawables/LayoutValue";
import { SpriteTextDrawNode } from "./SpriteTextDrawNode";

export class LoreAccurateSpriteText extends Drawable
{
  private static readonly default_never_fixed_width_characters = [".", ",", ":", " ", "\u00A0", "\u202F"];

  @resolved(FontStore, true)
  private store?: FontStore;

  protected override createDrawNode(): Container
  {
    return new SpriteTextDrawNode(this);
  }

  constructor()
  {
    super();

    this.addLayout(this.#charactersCache);
    this.addLayout(this.#textBuilderCache);
  }

  #text = "";

  get text(): string
  {
    return this.#text;
  }

  set text(value: string)
  {
    if (this.#text === value)
      return;

    this.#text = value;
    this.#invalidate(true, true);
  }

  #font = FontUsage.Default;

  get font(): FontUsage
  {
    return this.#font;
  }

  set font(value: FontUsage)
  {
    if (this.#font === value)
      return;

    this.#font = value;
    this.#invalidate(true, true);
  }

  #allowMultiLine = true;

  get allowMultiLine(): boolean
  {
    return this.#allowMultiLine;
  }

  set allowMultiLine(value: boolean)
  {
    if (this.#allowMultiLine == value)
      return;

    this.#allowMultiLine = value;

    if (value)
      this.truncate = false;

    this.#invalidate(true, true);
  }

  #useFullGlyphHeight = true;

  get useFullGlyphHeight(): boolean
  {
    return this.#useFullGlyphHeight;
  }

  set useFullGlyphHeight(value: boolean)
  {
    if (this.#useFullGlyphHeight == value)
      return;

    this.#useFullGlyphHeight = value;

    this.#invalidate(true, true);
  }

  #truncate = false;

  get truncate(): boolean
  {
    return this.#truncate;
  }

  set truncate(value: boolean)
  {
    if (this.#truncate === value)
      return;

    if (value)
      this.allowMultiLine = false;

    this.#truncate = value;
    this.#invalidate(true, true);
  }

  #ellipsisString = "…";

  get ellipsisString(): string
  {
    return this.#ellipsisString;
  }

  set ellipsisString(value: string)
  {
    if (this.#ellipsisString === value)
      return;

    this.#ellipsisString = value;
    this.#invalidate(true, true);
  }

  #isTruncated = false;

  get isTruncated()
  {
    return this.#isTruncated;
  }

  get #requiresAutoSizedWidth()
  {
    return this.#explicitWidth === null && !(this.relativeSizeAxes & Axes.X);
  }

  get #requiresAutoSizedHeight()
  {
    return this.#explicitHeight === null && !(this.relativeSizeAxes & Axes.Y);
  }

  #explicitWidth: number | null = null;

  override get width(): number
  {
    if (this.#requiresAutoSizedWidth)
      this.#computeCharacters();

    return super.width;
  }

  override set width(value: number)
  {
    if (this.#explicitWidth === value)
      return;

    super.width = value;
    this.#explicitWidth = value;

    this.#invalidate(true, true);
  }

  #maxWidth: number = Number.POSITIVE_INFINITY;

  get maxWidth(): number
  {
    return this.#maxWidth;
  }

  set maxWidth(value: number)
  {
    if (this.#maxWidth === value)
      return;

    this.#maxWidth = value;
    this.#invalidate(true, true);
  }

  #explicitHeight: number | null = null;

  override get height(): number
  {
    if (this.#requiresAutoSizedHeight)
      this.#computeCharacters();

    return super.height;
  }

  override set height(value: number)
  {
    if (this.#explicitHeight === value)
      return;

    super.height = value;
    this.#explicitHeight = value;

    this.#invalidate(true, true);
  }

  override get size(): Vec2
  {
    if (this.#requiresAutoSizedWidth || this.#requiresAutoSizedHeight)
      this.#computeCharacters();

    return super.size;
  }

  override set size(value: IVec2 | number)
  {
    if (typeof value === "number")
    {
      this.width = value;
      this.height = value;
    }
    else
    {
      this.width = value.x;
      this.height = value.y;
    }
  }

  #spacing: Vec2 = Vec2.zero();

  get spacing(): Vec2
  {
    return this.#spacing;
  }

  set spacing(value: IVec2 | number)
  {
    const v = typeof value === "number"
        ? new Vec2(value)
        : Vec2.from(value);

    if (this.#spacing.equals(v))
      return;

    this.#spacing = v;
    this.#invalidate(true, true);
  }

  #padding: MarginPadding = MarginPadding.Default;

  get padding(): MarginPadding
  {
    return this.#padding;
  }

  set padding(value: MarginPaddingOptions)
  {
    const padding = MarginPadding.from(value);

    if (this.#padding.equals(padding))
      return;

    this.#padding = padding;
    this.#invalidate(true, true);
  }

  override get isPresent(): boolean
  {
    return super.isPresent || (this.alwaysPresent || this.#text.length > 0);
  }

  // #region Characters

  readonly #charactersCache = new LayoutMember(Invalidation.DrawSize | Invalidation.Presence, InvalidationSource.Parent);

  #charactersBacking: TextBuilderGlyph[] = [];

  /**
   * @internal
   */
  get characters()
  {
    this.#computeCharacters();
    return this.#charactersBacking;
  }

  #computeCharacters()
  {
    // if (!this.store)
    //   return;

    if (this.#charactersCache.isValid)
      return;

    this.#isTruncated = false;

    this.#charactersBacking.length = 0;

    let textBounds = new Vec2();

    try
    {
      if (this.#text.length === 0)
        return;

      const textBuilder = this.#getTextBuilder();

      textBuilder.reset();
      textBuilder.addText(this.#text);
      textBounds = textBuilder.bounds;

      // if (textBuilder instanceof TruncatingTextBuilder)
      //   this.#isTruncated = textBuilder.isTruncated;
    }
    finally
    {
      if (this.#requiresAutoSizedWidth)
        super.width = textBounds.x + this.padding.right;
      if (this.#requiresAutoSizedHeight)
        super.height = textBounds.y + this.padding.bottom;

      super.width = Math.min(super.width, this.maxWidth);

      this.#charactersCache.validate();

      (this.drawNode as SpriteTextDrawNode).updateGeometry();
    }
  }

  // #endregion

  // #region Invalidation

  #invalidate(characters: boolean = false, textBuilder: boolean = false)
  {
    if (characters)
      this.#charactersCache.invalidate();

    if (textBuilder)
      this.invalidateTextBuilder();

    this.invalidate(Invalidation.RequiredParentSizeToFit);
  }

  // #endregion

  protected get fixedWidthExcludeCharacters(): string[] | null
  {
    return null;
  }

  protected get fixedWidthReferenceCharacter(): string
  {
    return "m";
  }

  protected get fallbackCharacter(): string
  {
    return "?";
  }

  protected createTextBuilder(store: ITexturedGlyphLookupStore): TextBuilder
  {
    const excludeCharacters = this.fixedWidthExcludeCharacters ?? LoreAccurateSpriteText.default_never_fixed_width_characters;

    const builderMaxWidth = this.#requiresAutoSizedWidth
        ? this.maxWidth
        : this.applyRelativeAxes(this.relativeSizeAxes, new Vec2(Math.min(this.maxWidth, super.width), super.height), this.fillMode).x - this.padding.right;

    // TODO
    // if (this.allowMultiLine)
    // {
    //   return new MultilineTextBuilder(store, this.font, builderMaxWidth, this.useFullGlyphHeight, new Vec2(this.padding.left, this.padding.top), this.spacing, this.#charactersBacking,
    //       excludeCharacters, this.fallbackCharacter, this.fixedWidthReferenceCharacter);
    // }
    //
    // if (this.truncate)
    // {
    //   return new TruncatingTextBuilder(store, this.font, builderMaxWidth, this.ellipsisString, this.useFullGlyphHeight, new Vec2(this.padding.left, this.padding.top), this.spacing, this.#charactersBacking,
    //       excludeCharacters, this.fallbackCharacter, this.fixedWidthReferenceCharacter);
    // }

    return new TextBuilder(store, this.font, builderMaxWidth, this.useFullGlyphHeight, new Vec2(this.padding.left, this.padding.top), this.spacing, this.#charactersBacking,
        excludeCharacters, this.fallbackCharacter, this.fixedWidthReferenceCharacter);
  }

  readonly #textBuilderCache = new LayoutValue<TextBuilder>(Invalidation.DrawSize, InvalidationSource.Parent);

  protected invalidateTextBuilder()
  {
    this.#textBuilderCache.invalidate();
  }

  #getTextBuilder(): TextBuilder
  {
    if (!this.#textBuilderCache.isValid)
      this.#textBuilderCache.value = this.createTextBuilder(this.store!);

    return this.#textBuilderCache.value;
  }

  get lineBaseHeight()
  {
    this.#computeCharacters();
    return this.#textBuilderCache.value.lineBaseHeight;
  }

  override updateSubTreeTransforms(): boolean
  {
    if (!super.updateSubTreeTransforms())
      return false;

    this.#computeCharacters();
    return true;
  }
}
