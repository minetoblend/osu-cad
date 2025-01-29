import type {
  ClickEvent,
  MouseDownEvent,
  MouseUpEvent,
} from '@osucad/framework';
import { PreferencesOverlay } from '@osucad/core';
import {
  Anchor,
  Axes,
  Container,

  DrawableSprite,
  EasingFunction,
  MouseButton,
  resolved,
} from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { ToolbarButton } from './ToolbarButton';

export class ToolbarSettingsButton extends ToolbarButton {
  constructor() {
    super();

    this.addInternal(new Container({
      autoSizeAxes: Axes.Both,
      padding: { horizontal: 15 },
      anchor: Anchor.Center,
      origin: Anchor.Center,
      child: new Container({
        size: 20,
        child: this.#icon = new DrawableSprite({
          texture: getIcon('cog'),
          relativeSizeAxes: Axes.Both,
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      }),
    }));
  }

  readonly #icon!: DrawableSprite;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#icon.scaleTo(0.85, 400, EasingFunction.OutExpo);
    }

    return true;
  }

  override onMouseUp(e: MouseUpEvent) {
    this.#icon.scaleTo(1, 300, EasingFunction.OutBack);
  }

  @resolved(PreferencesOverlay)
  preferences!: PreferencesOverlay;

  override onClick(e: ClickEvent): boolean {
    this.preferences.toggleVisibility();

    this.#icon.rotateTo(0)
      .rotateTo(Math.PI, 1000, EasingFunction.OutExpo)
      .then()
      .rotateTo(0);
    return true;
  }
}
