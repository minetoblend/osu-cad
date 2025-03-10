import type { FontDefinition } from './FontDefinition';
import { BitmapFontManager } from 'pixi.js';
import { Cached } from '../../caching';
import { PIXIBitmapText, PIXIContainer, PIXITextStyle, type PIXITextStyleOptions } from '../../pixi';
import { Drawable, type DrawableOptions, Invalidation } from '../drawables/Drawable';

export interface SpriteTextOptions extends DrawableOptions {
  text?: string;
  style?: PIXITextStyle | PIXITextStyleOptions;
  font?: FontDefinition;
}

export class SpriteText extends Drawable {
  constructor(options: SpriteTextOptions = {}) {
    const { text, font, style, ...rest } = options;

    super();

    this.with(rest);

    this.text = text ?? '';

    if (style) {
      this.#textStyle = new PIXITextStyle(style);
    }
    else if (font) {
      this.#textStyle = new PIXITextStyle(font.style);
    }
    else {
      this.#textStyle = new PIXITextStyle();
    }

    this.#textStyle.on('update', () => this.#textBacking.invalidate());

    this.#textDrawNode = new PIXIBitmapText({
      style: this.#textStyle,
    });

    // @ts-expect-error readonly property
    this.#textDrawNode.renderPipeId = 'spriteText';

    this.drawNode.addChild(this.#textDrawNode);
  }

  readonly #textDrawNode: PIXIBitmapText;

  createDrawNode(): PIXIContainer {
    return new PIXIContainer();
  }

  #textBacking = new Cached();

  #textStyle: PIXITextStyle;

  get style() {
    return this.#textStyle;
  }

  set style(value: PIXITextStyle) {
    this.#textStyle = value;
    this.#textDrawNode.style = value;
    this.#textBacking.invalidate();
  }

  protected get textDrawNode() {
    return this.#textDrawNode;
  }

  #text: string = '';

  get text() {
    return this.#text;
  }

  set text(value: string) {
    if (value === this.#text)
      return;

    this.#text = value;

    this.#textBacking.invalidate();
    this.invalidate(Invalidation.DrawSize);
  }

  override update() {
    super.update();

    if (!this.#textBacking.isValid) {
      this.#textDrawNode.text = this.#text;

      const { width, height, scale } = BitmapFontManager.getLayout(this.text, this.#textDrawNode.style, false);
      this.updateSize(width * scale, height * scale);

      this.#textBacking.validate();
    }
  }

  protected updateSize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}
