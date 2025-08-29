import { BitmapFontManager, BitmapText, Container, TextStyle, type TextStyleOptions } from "pixi.js";
import { Cached } from "../../caching";
import { Drawable, type DrawableOptions, Invalidation } from "../drawables/Drawable";
import type { FontDefinition } from "./FontDefinition";

export interface SpriteTextOptions extends DrawableOptions
{
  text?: string;
  style?: TextStyle | TextStyleOptions;
  font?: FontDefinition;
}

export class SpriteText extends Drawable
{
  public constructor(options: SpriteTextOptions = {})
  {
    const { text, font, style, ...rest } = options;

    super();

    this.with(rest);

    this.text = text ?? "";

    if (style)
    {
      this.#textStyle = new TextStyle(style);
    }
    else if (font)
    {
      this.#textStyle = new TextStyle(font.style);
    }
    else
    {
      this.#textStyle = new TextStyle();
    }

    this.#textStyle.on("update", () => this.#textBacking.invalidate());

    this.#textDrawNode = new BitmapText({
      style: this.#textStyle,
    });

    // @ts-expect-error readonly property
    this.#textDrawNode.renderPipeId = "spriteText";

    this.drawNode.addChild(this.#textDrawNode);
  }

  readonly #textDrawNode: BitmapText;

  protected createDrawNode(): Container
  {
    return new Container();
  }

  #textBacking = new Cached();

  #textStyle: TextStyle;

  public get style()
  {
    return this.#textStyle;
  }

  public set style(value: TextStyle)
  {
    this.#textStyle = value;
    this.#textDrawNode.style = value;
    this.#textBacking.invalidate();
  }

  protected get textDrawNode()
  {
    return this.#textDrawNode;
  }

  #text: string = "";

  public get text()
  {
    return this.#text;
  }

  public set text(value: string)
  {
    if (value === this.#text)
      return;

    this.#text = value;

    this.#textBacking.invalidate();
    this.invalidate(Invalidation.DrawSize);
  }

  protected override update()
  {
    super.update();

    if (!this.#textBacking.isValid)
    {
      this.#textDrawNode.text = this.#text;

      const { width, height, scale } = BitmapFontManager.getLayout(this.text, this.#textDrawNode.style, false);
      this.updateSize(width * scale, height * scale);

      this.#textBacking.validate();
    }
  }

  protected updateSize(width: number, height: number)
  {
    this.width = width;
    this.height = height;
  }
}
