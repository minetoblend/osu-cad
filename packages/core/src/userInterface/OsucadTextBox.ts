import type { Drawable, FocusEvent, FocusLostEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, BasicTextBox, Box, EasingFunction, RoundedBox, Vec2 } from '@osucad/framework';
import { Color } from 'pixi.js';
import { OsucadSpriteText } from '../drawables/OsucadSpriteText';

export class OsucadTextBox extends BasicTextBox {
  #focusLine!: Box;

  #accentColor = new Color(0x52CCA3);

  get accentColor(): Color {
    return this.#accentColor;
  }

  set accentColor(color: ColorSource) {
    this.#accentColor = new Color(color);
    if (this.isLoaded)
      this.#focusLine.color = this.#accentColor;
  }

  protected override get leftRightPadding(): number {
    return 8;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.backgroundUnfocused = new Color(0x000000).setAlpha(0.4);
    this.backgroundFocused = new Color(0x44444A).setAlpha(0.4);

    this.cornerRadius = 4;

    this.add(new RoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 4,
      fillAlpha: 0,
      depth: 0,
      outline: {
        width: 1.5,
        color: 0xFFFFFF,
        alignment: 1,
        alpha: 0.05,
      },
    }));

    this.add(this.#focusLine = new Box({
      relativeSizeAxes: Axes.X,
      size: new Vec2(1, 1.5),
      anchor: Anchor.BottomCenter,
      origin: Anchor.BottomCenter,
      color: this.accentColor,
    }));
  }

  override onFocus(e: FocusEvent) {
    super.onFocus(e);

    this.#focusLine
      .fadeIn(400, EasingFunction.OutCubic)
      .resizeWidthTo(1, 400, EasingFunction.OutExpo);
  }

  override onFocusLost(e: FocusLostEvent) {
    super.onFocusLost(e);

    if (!this.requestsFocus) {
      this.#focusLine
        .fadeOut(400, EasingFunction.OutExpo)
        .resizeWidthTo(0, 400, EasingFunction.OutExpo);
    }
  }

  protected override getFallingChar(c: string): Drawable {
    return new OsucadSpriteText({
      text: c,
      fontSize: this.fontSize,
    });
  }
}
