import type { Bindable, ClickEvent, DrawableOptions, FocusEvent, FocusLostEvent, KeyDownEvent } from 'osucad-framework';
import type { Graphics } from 'pixi.js';
import { Axes, BindableWithCurrent, Container, GraphicsDrawable, Key, RoundedBox, TabbableContainer, Vec2 } from 'osucad-framework';
import { OsucadColors } from '../OsucadColors';

export interface CheckboxOptions extends DrawableOptions {
  current?: Bindable<boolean>;
}

export class Checkbox extends TabbableContainer {
  constructor(options: CheckboxOptions = {}) {
    super();

    this.size = new Vec2(18);

    this.with(options);

    this.internalChildren = [
      this.#background = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        fillAlpha: 0.2,
        cornerRadius: 4,
        outline: {
          width: 1,
          color: 0x000000,
          alpha: 0.2,
        },
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: 4,
        child: this.#check = new Check().with({
          relativeSizeAxes: Axes.Both,
          color: OsucadColors.primary,
        }),
      }),
    ];
  }

  #background!: RoundedBox;

  #check!: Check;

  #current = new BindableWithCurrent(false);

  get current(): BindableWithCurrent<boolean> {
    return this.#current;
  }

  set current(value: Bindable<boolean>) {
    this.#current.current = value;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.current.bindValueChanged((checked) => {
      if (checked.value)
        this.#check.show();
      else
        this.#check.hide();
    }, true);
  }

  override onClick(e: ClickEvent): boolean {
    this.current.value = !this.current.value;
    return true;
  }

  override get acceptsFocus(): boolean {
    return true;
  }

  override onFocus(e: FocusEvent) {
    this.#background.outline = {
      width: 2,
      color: OsucadColors.primary,
      alpha: 0.75,
    };
  }

  override onFocusLost(e: FocusLostEvent) {
    this.#background.outline = {
      width: 1,
      color: 0x000000,
      alpha: 0.2,
    };
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (!this.hasFocus)
      return false;

    if (e.key === Key.Space) {
      this.current.value = !this.current.value;
      return true;
    }

    return super.onKeyDown(e);
  }
}

class Check extends GraphicsDrawable {
  constructor() {
    super();
  }

  override updateGraphics(g: Graphics) {
    g.clear();

    const { drawWidth, drawHeight } = this;

    g.moveTo(0, drawHeight * 0.5)
      .lineTo(drawWidth * 0.33, drawHeight * 0.8)
      .lineTo(drawWidth, drawHeight * 0.2)
      .stroke({
        width: 3,
        color: 0xFFFFFF,
        join: 'round',
        cap: 'round',
      });
  }
}
