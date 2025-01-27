import type { FocusEvent } from '../../input/events/FocusEvent';
import type { FocusLostEvent } from '../../input/events/FocusLostEvent';
import type { Drawable } from '../drawables/Drawable';
import { Color } from 'pixi.js';
import { Vec2 } from '../../math/Vec2';
import { Container } from '../containers/Container';
import { Anchor } from '../drawables/Anchor';
import { Axes } from '../drawables/Axes';
import { Box } from '../shapes/Box';
import { FastRoundedBox } from '../shapes/FastRoundedBox';
import { EasingFunction } from '../transforms/EasingFunction';
import { Caret } from './Caret';
import { TextBox } from './TextBox';

const caret_move_time = 60;

export class BasicTextBox extends TextBox {
  protected get caretWidth() {
    return 2;
  }

  protected get selectionColor() {
    return new Color(0xADFF2F);
  }

  backgroundCommit = new Color('rgb(57, 110, 102)');

  #backgroundFocused = new Color('rgba(100, 100, 100, 255)');
  #backgroundUnfocused = new Color('rgba(100, 100, 100, 120)');

  readonly #background: Drawable;

  protected createBackground(): Drawable {
    return new Box({
      relativeSizeAxes: Axes.Both,
      depth: 1,
      color: this.backgroundUnfocused,
    });
  }

  protected get backgroundFocused() {
    return this.#backgroundFocused;
  }

  protected set backgroundFocused(value) {
    this.#backgroundFocused = value;
    if (this.hasFocus)
      this.#background.color = value;
  }

  protected get backgroundUnfocused() {
    return this.#backgroundUnfocused;
  }

  protected set backgroundUnfocused(value) {
    this.#backgroundUnfocused = value;
    if (!this.hasFocus)
      this.#background.color = value;
  }

  protected get inputErrorColour() {
    return new Color(0xFF0000);
  }

  constructor() {
    super();

    this.add(this.#background = this.createBackground());

    this.backgroundFocused = new Color('rgba(51, 88, 96, 255)');
    this.backgroundUnfocused = new Color('rgba(29, 49, 52, 255)');
    this.textContainer.height = 0.75;
  }

  protected override notifyInputError() {
    this.#background.flashColorTo(this.inputErrorColour, 200);
  }

  protected override onTextCommitted(textChanged: boolean) {
    super.onTextCommitted(textChanged);

    this.#background.color = this.releaseFocusOnCommit ? this.backgroundUnfocused : this.backgroundFocused;
    this.#background.clearTransforms();
    this.#background.flashColorTo(this.backgroundCommit, 400);
  }

  override onFocusLost(e: FocusLostEvent) {
    super.onFocusLost(e);

    this.#background.clearTransforms();
    this.#background.color = this.backgroundFocused;
    this.#background.fadeColor(this.backgroundUnfocused, 200, EasingFunction.OutExpo);
  }

  override onFocus(e: FocusEvent) {
    super.onFocus(e);

    this.#background.clearTransforms();
    this.#background.color = this.backgroundUnfocused;
    this.#background.fadeColor(this.backgroundFocused, 200, EasingFunction.Out);
  }

  protected override createCaret(): Caret {
    return new BasicCaret().adjust((c) => {
      c.caretWidth = this.caretWidth;
      c.selectionColor = this.selectionColor;
    });
  }

  protected override getDrawableCharacter(c: string): Drawable {
    return new FallingDownContainer({
      autoSizeAxes: Axes.Both,
      child: this.getFallingChar(c),
    });
  }

  protected getFallingChar(c: string) {
    return super.getDrawableCharacter(c);
  }
}

class BasicCaret extends Caret {
  constructor() {
    super();

    this.color = 'transparent';

    this.internalChild = new FastRoundedBox({
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
      relativeSizeAxes: Axes.Both,
      height: 0.9,
      cornerRadius: 1,
    });
  }

  override hide() {
    this.fadeOut(200);
  }

  override show() {
    super.show();
    this.#didShow = true;
  }

  #didShow = false;

  caretWidth = 0;

  selectionColor = new Color('white');

  override displayAt(position: Vec2, selectionWidth: number | null): void {
    if (selectionWidth != null) {
      this.moveTo(new Vec2(position.x, position.y), 60, EasingFunction.Out);
      this.resizeWidthTo(selectionWidth + this.caretWidth / 2, caret_move_time, EasingFunction.Out);
      this
        .fadeTo(0.5, 200, EasingFunction.Out)
        .fadeColor(this.selectionColor, 200, EasingFunction.Out);
    }
    else {
      this.moveTo(new Vec2(position.x - this.caretWidth / 2, position.y), 60, EasingFunction.Out);
      this.resizeWidthTo(this.caretWidth, caret_move_time, EasingFunction.Out);
      this.fadeColor(0xFFFFFF, 200, EasingFunction.Out);

      // TODO: loop
    }

    if (this.#didShow) {
      this.finishTransforms();
      this.#didShow = false;
    }
  }
}

class FallingDownContainer extends Container {
  override show() {
    const col = this.color;
    this
      .fadeColor(new Color(col).setAlpha(0))
      .fadeColor(col.setAlpha(1), caret_move_time * 2, EasingFunction.Out);
  }

  override hide() {
    this.fadeOut(200);
    this.moveToY(this.drawSize.y, 200, EasingFunction.InQuad);
  }
}
