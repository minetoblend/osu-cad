import type {
  Bindable,
  ClickEvent,
  DrawableOptions,
  FocusEvent,
  FocusLostEvent,
  HoverEvent,
  HoverLostEvent,
  KeyDownEvent,
  MouseDownEvent,
} from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import {
  Anchor,
  Axes,
  BindableBoolean,
  BindableWithCurrent,
  Box,
  CompositeDrawable,
  Container,
  dependencyLoader,
  EasingFunction,
  Key,
  MaskingContainer,
  MouseButton,
  resolved,
  RoundedBox,
  TabbableContainer,
} from 'osucad-framework';
import { ThemeColors } from '../editor/ThemeColors';
import { OsucadSpriteText } from '../OsucadSpriteText';

export interface ButtonGroupSelectItem<T> {
  label: string;
  value: T;
}

export interface ButtonGroupSelectOptions<T> extends DrawableOptions {
  items: ButtonGroupSelectItem<T>[];

}

export class ButtonGroupSelect<T> extends TabbableContainer {
  constructor(options: ButtonGroupSelectOptions<T>) {
    const { items, ...rest } = options;

    super();

    this.with(rest);

    this.items = items;

    this.#current = new BindableWithCurrent<T>(items[0].value);
  }

  readonly items: ButtonGroupSelectItem<T>[];

  readonly #current: BindableWithCurrent<T>;

  get current() {
    return this.#current.current;
  }

  set current(value: Bindable<T>) {
    this.#current.current = value;
  }

  get acceptsFocus(): boolean {
    return true;
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  #background!: Box;

  #backgroundColor: ColorSource = 0x222228;

  get backgroundColor() {
    return this.#backgroundColor;
  }

  set backgroundColor(value: ColorSource) {
    this.#backgroundColor = value;
    if (this.#background)
      this.#background.color = value;
  }

  @dependencyLoader()
  load() {
    this.addAllInternal(
      this.#focusRing = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        fillAlpha: 0,
        cornerRadius: 6,
        alpha: 0,
        outlines: [{
          color: this.colors.text,
          alpha: 0.25,
          width: 5,
        }],
      }),
      new MaskingContainer({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 6,
        children: [
          this.#background = new Box({
            relativeSizeAxes: Axes.Both,
            color: this.#backgroundColor,
          }),
          this.#content = new Container({
            relativeSizeAxes: Axes.Both,
          }),
        ],
      }),
    );

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];

      this.content.add(new ButtonGroupSelectButton(item).with({
        relativeSizeAxes: Axes.Both,
        relativePositionAxes: Axes.Both,
        width: 1 / this.items.length,
        x: i / (this.items.length),
      }));
    }

    this.#current.addOnChangeListener((e) => {
      for (const child of this.content.children) {
        child.active.value = child.item.value === e.value;
      }
    }, { immediate: true });
  }

  #content!: Container<ButtonGroupSelectButton>;

  #focusRing!: RoundedBox;

  get content() {
    return this.#content;
  }

  onFocus(e: FocusEvent) {
    this.#focusRing.alpha = 1;
  }

  onFocusLost(e: FocusLostEvent) {
    this.#focusRing.alpha = 0;
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (!this.hasFocus)
      return false;

    if (e.key === Key.ArrowRight) {
      this.moveSelectionon(1);
      return true;
    }
    else if (e.key === Key.ArrowLeft) {
      this.moveSelectionon(-1);
      return true;
    }

    return super.onKeyDown(e);
  }

  moveSelectionon(direction: number) {
    const value = this.current.value;

    let index = this.items.findIndex(it => it.value === value);

    index = index + direction;

    if (index < 0)
      index = this.items.length - 1;
    else if (index >= this.items.length)
      index = 0;

    this.current.value = this.items[index].value;
  }

  withCurrent(value: Bindable<T>): this {
    this.current = value;
    return this;
  }

  withBackgroundColor(value: ColorSource): this {
    this.backgroundColor = value;
    return this;
  }
}

class ButtonGroupSelectButton extends CompositeDrawable {
  constructor(readonly item: ButtonGroupSelectItem<any>) {
    super();

    this.addAllInternal(
      this.#background = new Box({
        relativeSizeAxes: Axes.Both,
      }),
      this.#text = new OsucadSpriteText({
        text: item.label,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.#hoverOverlay = new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
      }),
    );
  }

  readonly #background!: Box;

  readonly #hoverOverlay!: Box;

  readonly #text!: OsucadSpriteText;

  @resolved(ThemeColors)
  colors!: ThemeColors;

  active = new BindableBoolean(false);

  @dependencyLoader()
  load() {
    this.#background.color = this.colors.primary;

    this.active.addOnChangeListener(e => this.#background.fadeTo(e.value ? 1 : 0, 100), { immediate: true });
  }

  onHover(e: HoverEvent): boolean {
    this.#hoverOverlay.alpha = 0.1;
    return true;
  }

  onHoverLost(e: HoverLostEvent) {
    this.#hoverOverlay.alpha = 0;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#text.scaleTo(0.85, 300, EasingFunction.OutExpo);
      return true;
    }

    return false;
  }

  onMouseUp(e: MouseDownEvent) {
    if (e.button === MouseButton.Left) {
      this.#text.scaleTo(1, 300, EasingFunction.OutBack);
    }
  }

  onClick(e: ClickEvent): boolean {
    this.findClosestParentOfType(ButtonGroupSelect)!.current.value = this.item.value;

    return true;
  }
}
