import type { Bindable, ClickEvent, DrawableOptions, FocusEvent, FocusLostEvent, KeyDownEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { Graphics } from 'pixi.js';
import { Anchor, Axes, BindableWithCurrent, Box, Container, GraphicsDrawable, Key, TabbableContainer, Vec2 } from '@osucad/framework';
import { Color } from 'pixi.js';
import { OsucadColors } from '../OsucadColors';
import { ITabbableContentContainer } from '../overlays/preferencesV2/ITabbableContentContainer';

export interface CheckboxOptions extends DrawableOptions {
  current?: Bindable<boolean>;
}

export class Checkbox extends TabbableContainer {
  constructor(options: CheckboxOptions = {}) {
    super();

    this.size = new Vec2(20);

    this.with(options);

    this.internalChildren = [
      this.#outline = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        masking: true,
        cornerRadius: 6,
        scale: 1,
        child: new Box({
          relativeSizeAxes: Axes.Both,
          alpha: 0,
          alwaysPresent: true,
        }),
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        masking: true,
        cornerRadius: 4,
        children: [
          this.#background = new Box({
            relativeSizeAxes: Axes.Both,
            alpha: 0.2,
          }),
          new Container({
            relativeSizeAxes: Axes.Both,
            padding: 4,
            child: this.#check = new Check().with({
              relativeSizeAxes: Axes.Both,
              color: OsucadColors.primary,
            }),
          }),
        ],
      }),
    ];
  }

  readonly #outline: Container;

  readonly #background: Box;

  readonly #check: Check;

  #current = new BindableWithCurrent(false);

  get current(): BindableWithCurrent<boolean> {
    return this.#current;
  }

  set current(value: Bindable<boolean>) {
    this.#current.current = value;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const tabbableContentContainer = dependencies.resolveOptional(ITabbableContentContainer);
    if (tabbableContentContainer)
      this.tabbableContentContainer ??= tabbableContentContainer;
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
    this.#outline
      .scaleTo(1.35, 200)
      .transformTo('borderThickness', 2.7, 200)
      .transformTo('borderColor', new Color(OsucadColors.primary).setAlpha(0.5), 200);
  }

  override onFocusLost(e: FocusLostEvent) {
    this.#outline
      .scaleTo(1, 200)
      .transformTo('borderThickness', 0, 200)
      .transformTo('borderColor', new Color(OsucadColors.primary).setAlpha(0), 200);
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
