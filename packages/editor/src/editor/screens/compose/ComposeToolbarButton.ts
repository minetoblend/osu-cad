import gsap from 'gsap';
import {
  Axes,
  Button,
  Container,
  DrawableSprite,
  FillDirection,
  FillFlowContainer,
  FillMode,
  HoverEvent,
  HoverLostEvent,
  MouseDownEvent,
  MouseUpEvent,
  RoundedBox,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Texture } from 'pixi.js';
import { ThemeColors } from '../../ThemeColors';
import { Anchor, ButtonTrigger } from 'osucad-framework';
import { UISamples } from '../../../UISamples';

export class ComposeToolbarButton extends Button {
  constructor(icon: Texture) {
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
      })),
      (this.#outline = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 8,
        fillAlpha: 0,
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
      this.#icon.color = 0x32d2ac;

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
      this.#icon.color = this.isHovered ? 0xffffff : 0xbbbec5;
      gsap.to(this, {
        outlineVisibility: 0,
        duration: 0.2,
        onUpdate: () => {
          this.#updateOutline();
        },
      });
    }
  }

  @resolved(UISamples)
  samples!: UISamples;

  onHover(e: HoverEvent): boolean {
    this.#updateState();
    this.samples.toolHover.play();
    return true;
  }

  onHoverLost(e: HoverLostEvent): boolean {
    this.#updateState();
    return true;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (!super.onMouseDown(e)) return false;
    this.samples.toolSelect.play();

    gsap.to(this.#icon, {
      scaleX: 0.85,
      scaleY: 0.85,
      duration: 0.3,
      ease: 'power4.out',
    });
    return true;
  }

  onMouseUp(e: MouseUpEvent): boolean {
    gsap.to(this.#icon, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.3,
      ease: 'back.out',
    });
    return true;
  }
}
