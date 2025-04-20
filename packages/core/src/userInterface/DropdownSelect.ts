import type { Drawable, DrawableOptions, HoverEvent, ReadonlyDependencyContainer, ScrollContainer } from '@osucad/framework';
import { Anchor, Axes, Bindable, BindableWithCurrent, Box, Button, Container, DrawableSprite, EasingFunction, EmptyDrawable, FillFlowContainer, FillMode, MaskingContainer } from '@osucad/framework';
import { OsucadIcons } from '@osucad/resources';
import { Color } from 'pixi.js';
import { OsucadScrollContainer } from '../drawables/OsucadScrollContainer';
import { OsucadSpriteText } from '../drawables/OsucadSpriteText';
import { OsucadColors } from '../OsucadColors';
import { TextBox } from './TextBox';

export interface DropdownSelectOptions<T> extends DrawableOptions {
  items: DropdownItem<T>[];
  current?: Bindable<T | null>;
}

export class DropdownSelect<T> extends MaskingContainer {
  constructor(options: DropdownSelectOptions<T>) {
    super();

    this.with(options);
  }

  #items: DropdownItem<T>[] = [];

  get items() {
    return this.#items;
  }

  set items(value) {
    this.#items = value;
    this.#createItems();

    this.currentItem.value = this.#items.length > 0 ? this.#items[0] : null;
  }

  currentItem = new Bindable<DropdownItem<T> | null>(null);

  #current = new BindableWithCurrent<T | null>(null);

  get current() {
    return this.#current.current;
  }

  set current(value) {
    this.#current.current = value;
  }

  #itemsFlow!: FillFlowContainer<DrawableDropdownItem<T>>;

  private expanded = new Bindable(false);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;
    this.cornerRadius = 6;

    this.autoSizeDuration = 400;
    this.autoSizeEasing = EasingFunction.OutExpo;

    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
      }),
      new FillFlowContainer({
        autoSizeAxes: Axes.Y,
        relativeSizeAxes: Axes.X,

        children: [
          this.#textBox = new DropdownTextBox(this.currentItem),
          this.#scroll = new OsucadScrollContainer().with({
            relativeSizeAxes: Axes.X,
            children: [
              this.#itemsFlow = new FillFlowContainer({
                relativeSizeAxes: Axes.X,
                autoSizeAxes: Axes.Y,
              }),
            ],
          }),
        ],
      }),
    );

    this.current.bindValueChanged(e => this.currentItem.value = this.#items.find(it => it.value === e.value) ?? null, true);

    this.currentItem.bindValueChanged(e => this.current.value = e.value?.value ?? null);

    this.expanded.bindTo(this.#textBox.focused);

    this.expanded.valueChanged.addListener(this.#updateAutoSizing, this);
    this.#updateAutoSizing();

    this.#textBox.current.addOnChangeListener((e) => {
      const term = e.value.trim().toLowerCase();
      for (const item of this.#itemsFlow.children) {
        if (term.length === 0 || item.item.text.toLowerCase().includes(term))
          item.alpha = 1;
        else
          item.alpha = 0;
      }
    });
  }

  #scroll!: ScrollContainer;

  override update() {
    super.update();

    this.#scroll.height
      = this.expanded.value
        ? Math.min(this.#scroll.scrollContent.drawHeight, 200)
        : 0;
  }

  #textBox!: DropdownTextBox;

  #updateAutoSizing() {
    this.#itemsFlow.bypassAutoSizeAxes = this.expanded.value ? Axes.None : Axes.Y;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.#createItems();
  }

  #createItems() {
    if (!this.isLoaded)
      return;

    this.#itemsFlow.children = this.#items.map(it => new DrawableDropdownItem(it, () => this.#selectItem(it)));
  }

  #selectItem(item: DropdownItem<T>) {
    this.current.value = item.value;
  }
}

class DropdownTextBox extends TextBox {
  constructor(
    value: Bindable<DropdownItem<any> | null>,
  ) {
    super();
    this.dropdownValue = value.getBoundCopy();
  }

  dropdownValue: Bindable<DropdownItem<any> | null>;

  protected override createBackground(): Drawable {
    return new EmptyDrawable();
  }

  override commitImmediately = true;

  focused = new Bindable(false);

  #caret!: DrawableSprite;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(this.#caret = new DrawableSprite({
      texture: OsucadIcons.get('caret-left'),
      relativeSizeAxes: Axes.Both,
      fillMode: FillMode.Fit,
      scale: 0.5,
      anchor: Anchor.CenterRight,
      origin: Anchor.Center,
      x: -12,
      color: OsucadColors.text,
    }));
  }

  protected override loadComplete() {
    super.loadComplete();

    this.focused.addOnChangeListener((e) => {
      this.#caret.rotateTo(e.value ? -Math.PI / 2 : 0, 400, EasingFunction.OutElasticHalf);
      this.#updatePlaceholder();
    });

    this.dropdownValue.valueChanged.addListener(this.#updatePlaceholder, this);
    this.#updatePlaceholder();
  }

  #placeholder!: OsucadSpriteText;

  #updatePlaceholder() {
    this.placeholderText = this.dropdownValue.value?.text ?? '';

    this.#placeholder.color = new Color(OsucadColors.text).setAlpha(this.hasFocus ? 0.5 : 1);
  }

  protected override createPlaceholder(): OsucadSpriteText {
    return this.#placeholder = super.createPlaceholder().adjust(it => it.style.fontSize = 14);
  }

  override onFocus(): boolean {
    this.focused.value = true;
    return super.onFocus();
  }

  override onFocusLost() {
    this.focused.value = false;
    super.onFocusLost();
  }
}

export class DropdownItem<T> {
  constructor(public text: string, public value: T) {
  }
}

export class DrawableDropdownItem<T> extends Button {
  constructor(readonly item: DropdownItem<T>, action: () => void) {
    super();

    this.action = action;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;
    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: { horizontal: 10, vertical: 5 },
        child: new OsucadSpriteText({
          text: this.item.text,
          color: OsucadColors.text,
          fontSize: 14,
        }),
      }),
      this.#hoverHighlight = new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
      }),
    );
  }

  #hoverHighlight!: Box;

  override onHover(e: HoverEvent): boolean {
    this.#hoverHighlight.alpha = 0.1;
    return true;
  }

  override onHoverLost(e: HoverEvent) {
    this.#hoverHighlight.alpha = 0;
  }
}
