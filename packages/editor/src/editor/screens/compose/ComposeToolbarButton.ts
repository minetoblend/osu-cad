import gsap from 'gsap';
import type { Key, KeyDownEvent, MouseDownEvent, MouseUpEvent } from 'osucad-framework';
import {
  Anchor,
  Axes,
  Button,
  Container,
  DrawableSprite,
  RoundedBox,
  Vec2,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import type { Texture } from 'pixi.js';
import { ThemeColors } from '../../ThemeColors';
import { UISamples } from '../../../UISamples';

export class ComposeToolbarButton extends Button {
  constructor(
    icon: Texture,
    readonly keyBinding?: Key,
  ) {
    super();

    this.size = new Vec2(ComposeToolbarButton.SIZE);

    // this.trigger = ButtonTrigger.MouseDown;

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
          (this.#background = new RoundedBox({
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
    this.updateState();
  }

  backgroundContainer!: Container;

  #background!: RoundedBox;

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
    this.#outlineVisibility = value;
    this.#outline.alpha = value;
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

  #active = false;

  get active() {
    return this.#active;
  }

  set active(value: boolean) {
    this.#active = value;
    this.updateState();
  }

  protected updateState() {
    if (this.active) {
      this.#icon.color = this.isHovered
        ? this.theme.primaryHighlight
        : this.theme.primary;

      this.#background.color = 0x303038;
      gsap.to(this, {
        outlineVisibility: 1,
        duration: 0.2,
        onUpdate: () => {
          this.#updateOutline();
        },
      });
    }
    else {
      this.#background.color = 0x222228;
      this.#icon.color = this.isHovered ? 'white' : '#bbbec5';
      gsap.to(this, {
        outlineVisibility: 0,
        duration: 0.2,
        onUpdate: () => {
          this.#updateOutline();
        },
      });
    }

    if (this.keyPressed || this.#mouseDown) {
      this.#icon.scaleTo({ scale: 0.85, duration: 300, easing: 'power4.out' });

      // resizing the background and outline instead of main body to make sure layout isn't affected
      this.backgroundContainer.scaleTo({ scale: 0.95, duration: 300, easing: 'power4.out' });
    }
    else {
      this.#icon.scaleTo({ scale: 1, duration: 300, easing: 'back.out' });

      this.backgroundContainer.scaleTo({ scale: 1, duration: 300, easing: 'back.out' });
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
    this.#mouseDown = true;
    this.updateState();

    return true;
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  onMouseUp(e: MouseUpEvent): boolean {
    this.#mouseDown = false;
    this.updateState();

    return true;
  }

  #mouseDown = false;

  protected keyPressed = false;

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.controlPressed || e.shiftPressed || e.altPressed)
      return false;

    if (this.keyBinding === e.key) {
      this.action?.();
      this.samples.toolSelect.play();
      this.keyPressed = true;
      this.updateState();

      return true;
    }
    return false;
  }

  onKeyUp(e: KeyDownEvent): boolean {
    if (this.keyBinding === e.key) {
      this.keyPressed = false;
      this.updateState();

      return true;
    }
    return false;
  }

  get acceptsFocus(): boolean {
    return true;
  }
}
