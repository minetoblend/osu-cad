import type {
  Drawable,
} from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import {

  Axes,
  Button,
  Container,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { FastRoundedBox } from '../drawables/FastRoundedBox.ts';
import { ThemeColors } from '../editor/ThemeColors.ts';
import { OsucadSpriteText } from '../OsucadSpriteText.ts';

export class OsucadButton extends Button {
  #backgroundColor: ColorSource = 0x1E1E23;

  #backgroundHoverColor: ColorSource = 0x2E2E33;

  get backgroundColor() {
    return this.#backgroundColor;
  }

  set backgroundColor(value) {
    this.#backgroundColor = value;
    this.scheduler.addOnce(this.updateBackground, this);
  }

  get backgroundHoverColor() {
    return this.#backgroundHoverColor;
  }

  set backgroundHoverColor(value) {
    this.#backgroundHoverColor = value;
    this.scheduler.addOnce(this.updateBackground, this);
  }

  protected updateBackground() {
    this.#background.color = this.isHovered ? this.#backgroundHoverColor : this.#backgroundColor;
  }

  #background!: Drawable;

  protected createBackground() {
    return new FastRoundedBox({
      relativeSizeAxes: Axes.Both,
      color: this.#backgroundColor,
      cornerRadius: 4,
    });
  }

  @dependencyLoader()
  load() {
    this.autoSizeAxes = Axes.Both;

    this.addAllInternal(
      this.#background = this.createBackground(),
      this.#content = new Container({
        autoSizeAxes: Axes.Both,
        padding: 8,
        child: this.#spriteText = this.createText(),
      }),
    );
  }

  #content!: Container;

  #spriteText!: OsucadSpriteText;

  #text = '';

  get text() {
    return this.#text;
  }

  set text(value) {
    this.#text = value;
    if (this.isLoaded)
      this.#spriteText.text = value;
  }

  override get content() {
    return this.#content;
  }

  protected createText() {
    return new OsucadSpriteText({
      text: this.#text,
      fontSize: 14,
    });
  }

  override onHover(): boolean {
    this.updateBackground();

    return true;
  }

  override onHoverLost() {
    this.updateBackground();
  }

  withText(text: string) {
    this.text = text;
    return this;
  }

  withAction(action: () => void) {
    this.action = action;
    return this;
  }

  withBackgroundColor(color: ColorSource, hoverColor: ColorSource = this.#backgroundHoverColor) {
    this.backgroundColor = color;
    this.backgroundHoverColor = hoverColor;

    return this;
  }

  @resolved(ThemeColors)
  protected colors!: ThemeColors;

  primary() {
    this.schedule(() => {
      this.backgroundColor = this.colors.primary;
      this.backgroundHoverColor = this.colors.primaryHighlight;
      this.updateBackground();
    });

    return this;
  }
}
