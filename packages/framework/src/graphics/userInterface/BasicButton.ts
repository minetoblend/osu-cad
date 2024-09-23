import type { ValueChangedEvent } from '../../bindables/Bindable.ts';
import type { ClickEvent } from '../../input/events/ClickEvent';
import type { HoverEvent } from '../../input/events/HoverEvent';
import type { DrawableOptions } from '../drawables/Drawable';
import { Color, type ColorSource } from '../../pixi';
import { Anchor } from '../drawables/Anchor';
import { Axes } from '../drawables/Axes';
import { Box } from '../shapes/Box';
import { SpriteText } from '../text/SpriteText';
import { EasingFunction } from '../transforms/EasingFunction.ts';
import { Button } from './Button';

export interface BasicButtonOptions extends DrawableOptions {
  text?: string;
  backgroundColor?: ColorSource;
  hoverColor?: ColorSource;
  flashColor?: ColorSource;
  disabledColor?: ColorSource;
  hoverFadeDuration?: number;
  flashDuration?: number;
  disabledFadeDuration?: number;
}

export class BasicButton extends Button {
  get text() {
    return this.spriteText.text;
  }

  set text(value: string) {
    this.spriteText.text = value;
  }

  get backgroundColor(): Color {
    return this.background.color;
  }

  set backgroundColor(value: Color) {
    this.background.color = value;
  }

  #flashColor?: Color;

  get flashColor(): Color {
    return this.#flashColor ?? this.backgroundColor;
  }

  set flashColor(value: ColorSource) {
    this.#flashColor = new Color(value);
  }

  get hoverColor() {
    return this.hover.color;
  }

  set hoverColor(value: ColorSource) {
    this.hover.color = value;
  }

  #disabledColour = new Color('rgb(128,128,128)');

  get disabledColor(): Color {
    return this.#disabledColour;
  }

  set disabledColor(value: ColorSource) {
    this.#disabledColour = new Color(value);
    this.enabled.triggerChange();
  }

  hoverFadeDuration = 200;

  flashDuration = 200;

  disabledFadeDuration = 200;

  spriteText: SpriteText;

  background: Box;

  hover: Box;

  constructor(options: BasicButtonOptions = {}) {
    super();
    this.autoSizeAxes = Axes.Both;

    this.addAll(
      (this.background = new Box({
        anchor: Anchor.Center,
        origin: Anchor.Center,
        relativeSizeAxes: Axes.Both,
        color: 'rgb(51, 88, 96)',
      })),
      (this.hover = new Box({
        alpha: 0,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        relativeSizeAxes: Axes.Both,
        color: new Color(0xFFFFFF).setAlpha(0.1),
      })),
      (this.spriteText = this.createText()),
    );

    this.withScope(() => {
      this.enabled.addOnChangeListener(this.#enabledChanged, {
        immediate: true,
      });
    });

    this.with(options);
  }

  createText(): SpriteText {
    return new SpriteText({
      anchor: Anchor.Center,
      origin: Anchor.Center,
      relativeSizeAxes: Axes.Both,
      style: {
        fill: 'rgb(250, 221, 114)',
      },
    });
  }

  override onClick(e: ClickEvent): boolean {
    if (this.enabled.value) {
      this.background.flashColorTo(this.flashColor, this.flashDuration);
    }

    return super.onClick(e);
  }

  override onHover(e: HoverEvent): boolean {
    if (this.enabled.value) {
      this.hover.fadeIn(this.hoverFadeDuration);
    }

    return super.onHover?.(e) ?? true;
  }

  override onHoverLost(e: HoverEvent): boolean {
    if (this.enabled.value) {
      this.hover.fadeOut(this.hoverFadeDuration);
    }

    return super.onHoverLost?.(e) ?? true;
  }

  #enabledChanged = (event: ValueChangedEvent<boolean>) => {
    const color = event.value ? 0xFFFFFF : this.disabledColor;

    this.fadeColor(color, this.disabledFadeDuration, EasingFunction.OutQuart);
  };
}
