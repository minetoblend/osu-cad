import type { CompositeDrawableOptions, Drawable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, Button, Container, FastRoundedBox } from '@osucad/framework';
import { OsucadSpriteText } from '../drawables/OsucadSpriteText';
import { OsucadColors } from '../OsucadColors';

export class OsucadButton extends Button {
  constructor(options: CompositeDrawableOptions = {}) {
    super();

    this.autoSizeAxes = Axes.Both;

    this.with(options);
  }

  #backgroundColor: ColorSource = 0x1E1E23;

  #backgroundHoverColor: ColorSource = 0x2E2E33;

  #backgroundAlpha = 1;

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

  get backgroundAlpha() {
    return this.#backgroundAlpha;
  }

  set backgroundAlpha(value) {
    this.#backgroundAlpha = value;
    this.scheduler.addOnce(this.updateBackground, this);
  }

  protected updateBackground() {
    this.#background.color = this.isHovered ? this.backgroundHoverColor : this.backgroundColor;
    this.#background.alpha = this.backgroundAlpha;
  }

  #background!: Drawable;

  protected createBackground() {
    return new FastRoundedBox({
      relativeSizeAxes: Axes.Both,
      color: this.#backgroundColor,
      cornerRadius: 4,
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAllInternal(
      this.#background = this.createBackground(),
      this.#content = new Container({
        autoSizeAxes: Axes.Both,
        padding: 8,
        child: this.#spriteText = this.createText(),
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );
  }

  #content!: Container;

  #spriteText!: OsucadSpriteText;

  get spriteText() {
    return this.#spriteText;
  }

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

  primary() {
    this.schedule(() => {
      this.backgroundColor = OsucadColors.primary;
      this.backgroundHoverColor = OsucadColors.primaryHighlight;
      this.updateBackground();
    });

    return this;
  }
}
