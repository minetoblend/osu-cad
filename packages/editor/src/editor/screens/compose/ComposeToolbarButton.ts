import gsap from 'gsap';
import {
  Anchor,
  Axes,
  Button,
  ButtonTrigger,
  dependencyLoader,
  DrawableSprite,
  FillDirection,
  FillFlowContainer,
  FillMode,
  HoverEvent,
  HoverLostEvent,
  Key,
  KeyDownEvent,
  MouseDownEvent,
  MouseUpEvent,
  resolved,
  RoundedBox,
} from 'osucad-framework';
import { Texture } from 'pixi.js';
import { ThemeColors } from '../../ThemeColors';
import { UISamples } from '../../../UISamples';

export class ComposeToolbarButton extends Button {
  constructor(
    icon: Texture,
    readonly keyBinding?: Key,
  ) {
    super();
    this.relativeSizeAxes = Axes.Both;
    this.fillMode = FillMode.Fit;
    this.trigger = ButtonTrigger.MouseDown;

    this.#iconTexture = icon;
  }

  @resolved(ThemeColors)
  theme!: ThemeColors;

  #iconTexture: Texture;

  @dependencyLoader()
  init() {
    this.addAllInternal(
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
      (this.#content = new FillFlowContainer({
        relativeSizeAxes: Axes.Both,
        direction: FillDirection.Vertical,
      })),
      (this.#icon = new DrawableSprite({
        texture: this.#iconTexture,
        relativeSizeAxes: Axes.Both,
        size: 0.65,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      })),
    );
    this.#updateState();
  }

  #background!: RoundedBox;

  #outline!: RoundedBox;

  #content!: FillFlowContainer;

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
    } else {
      this.#outline.outlines = [
        {
          color: 0xc0bfbd,
          width: 1.5 * this.outlineVisibility,
          alpha: 0.25 * this.outlineVisibility,
          alignment: 1,
        },
        {
          color: 0x32d2ac,
          width: 1.5 * this.outlineVisibility,
          alpha: 1 * this.outlineVisibility,
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
    this.#updateState();
  }

  #updateState() {
    this.drawNode;

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
    } else {
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

    if (this.#keyPressed || this.#mouseDown) {
      gsap.to(this.#icon, {
        scaleX: 0.85,
        scaleY: 0.85,
        duration: 0.3,
        ease: 'power4.out',
      });

      // resizing the background and outline instead of main body to make sure layout isn't affected
      gsap.to(this.#background, {
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 0.3,
        ease: 'power4.out',
      });
      gsap.to(this.#outline, {
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 0.3,
        ease: 'power4.out',
      });
    } else {
      gsap.to(this.#icon, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.3,
        ease: 'back.out',
      });

      gsap.to(this.#background, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.3,
        ease: 'back.out',
      });
      gsap.to(this.#outline, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.3,
        ease: 'back.out',
      });
    }
  }

  @resolved(UISamples)
  samples!: UISamples;

  onHover(e: HoverEvent): boolean {
    this.samples.toolHover.play({
      volume: 0.5,
    });
    this.#updateState();
    return true;
  }

  onHoverLost(e: HoverLostEvent): boolean {
    this.#updateState();
    return true;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (!super.onMouseDown(e)) return false;
    this.samples.toolSelect.play();
    this.#mouseDown = true;
    this.#updateState();

    return true;
  }

  onMouseUp(e: MouseUpEvent): boolean {
    this.#mouseDown = false;
    this.#updateState();

    return true;
  }

  #mouseDown = false;

  #keyPressed = false;

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.controlPressed || e.shiftPressed || e.altPressed) return false;

    if (this.keyBinding === e.key) {
      this.action?.();
      this.samples.toolSelect.play();
      this.#keyPressed = true;
      this.#updateState();

      return true;
    }
    return false;
  }

  onKeyUp(e: KeyDownEvent): boolean {
    if (this.keyBinding === e.key) {
      this.#keyPressed = false;
      this.#updateState();

      return true;
    }
    return false;
  }
}
