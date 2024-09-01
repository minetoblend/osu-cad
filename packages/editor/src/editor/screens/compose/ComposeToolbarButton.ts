import type { MouseDownEvent, MouseUpEvent } from 'osucad-framework';
import { Anchor, Axes, BindableBoolean, Button, Container, DrawableSprite, EasingFunction, RoundedBox, Vec2, dependencyLoader, resolved } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import { ThemeColors } from '../../ThemeColors';
import { UISamples } from '../../../UISamples';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox';

export class ComposeToolbarButton extends Button {
  constructor(
    icon: Texture,
  ) {
    super();

    this.size = new Vec2(ComposeToolbarButton.SIZE);

    this.#iconTexture = icon;
  }

  static readonly SIZE = 54;

  @resolved(ThemeColors)
  theme!: ThemeColors;

  #iconTexture: Texture;

  get iconTexture() {
    return this.#iconTexture;
  }

  set iconTexture(value: Texture) {
    this.#iconTexture = value;
    if (this.#icon) {
      this.#icon.texture = value;
    }
  }

  @dependencyLoader()
  init() {
    this.addAllInternal(
      this.backgroundContainer = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          (this.#background = new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 8,
            color: this.theme.translucent,
            alpha: 0.8,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          })),
          (this.#outline = new RoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 8,
            fillAlpha: 0,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          })),
        ],
      }),
      (this.#content = new Container({
        relativeSizeAxes: Axes.Both,
      })),
      (this.#icon = new DrawableSprite({
        texture: this.#iconTexture,
        relativeSizeAxes: Axes.Both,
        size: 0.65,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      })),
    );

    this.active.valueChanged.addListener(this.updateState, this);
  }

  protected loadComplete() {
    super.loadComplete();

    this.updateState();
  }

  backgroundContainer!: Container;

  #background!: FastRoundedBox;

  #outline!: RoundedBox;

  #content!: Container;

  #icon!: DrawableSprite;

  get content() {
    return this.#content;
  }

  #outlineVisibility = 0;

  get outlineVisibility() {
    return this.#outlineVisibility;
  }

  set outlineVisibility(value: number) {
    if (value === this.#outlineVisibility)
      return;

    this.#outlineVisibility = value;
    this.#outline.alpha = value;

    this.#updateOutline();
  }

  #updateOutline() {
    if (this.outlineVisibility === 0) {
      this.#outline.outlines = [];
    }
    else {
      this.#outline.outlines = [
        {
          color: 0xC0BFBD,
          width: 1.5 * this.outlineVisibility,
          alpha: 0.25 * this.outlineVisibility,
          alignment: 1,
        },
        {
          color: 0x32D2AC,
          width: 1.5 * this.outlineVisibility,
          alpha: this.outlineVisibility,
          alignment: 0,
        },
      ];
    }
  }

  readonly active = new BindableBoolean();

  protected updateState() {
    if (this.active.value) {
      this.#icon.color = this.isHovered
        ? this.theme.primaryHighlight
        : this.theme.primary;

      this.#background.color = 0x303038;
      this.transformTo('outlineVisibility', 1, 200);
    }
    else {
      this.#background.color = 0x222228;
      this.#icon.color = this.isHovered ? 'white' : '#bbbec5';
      this.transformTo('outlineVisibility', 0, 200);
    }

    if (this.armed) {
      this.#icon.scaleTo(0.85, 300, EasingFunction.OutQuart);

      // resizing the background and outline instead of main body to make sure layout isn't affected
      this.backgroundContainer.scaleTo(0.95, 300, EasingFunction.OutQuart);
    }
    else {
      this.#icon.scaleTo(1, 300, EasingFunction.OutBack);

      this.backgroundContainer.scaleTo(1, 300, EasingFunction.OutBack);
    }
  }

  @resolved(UISamples)
  samples!: UISamples;

  onHover(): boolean {
    this.samples.toolHover.play({
      volume: 0.5,
    });
    this.updateState();
    return true;
  }

  onHoverLost(): boolean {
    this.updateState();
    return true;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (!super.onMouseDown(e))
      return false;

    this.samples.toolSelect.play();
    this.armed = true;
    this.updateState();

    return true;
  }

  onMouseUp(e: MouseUpEvent) {
    this.armed = false;
    this.updateState();
  }

  #armed = false;

  get armed() {
    return this.#armed;
  }

  protected set armed(value) {
    if (value === this.#armed)
      return;

    this.#armed = value;

    this.updateState();
  }

  get acceptsFocus(): boolean {
    return true;
  }
}
