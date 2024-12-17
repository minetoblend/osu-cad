import type { ControlPointGroup } from '@osucad/common';
import type { Bindable, KeyDownEvent, MouseDownEvent, Vec2 } from 'osucad-framework';
import { Axes, dependencyLoader, EasingFunction, FastRoundedBox, Key, VisibilityContainer } from 'osucad-framework';

import { BackdropBlurFilter } from 'pixi-filters';
import { ControlPointProperties } from '../timing/properties/ControlPointProperties';

export class ControlPointPropertiesOverlay extends VisibilityContainer {
  constructor(
    controlPoint: Bindable<ControlPointGroup | null>,
  ) {
    super();
    this.controlPoint = controlPoint.getBoundCopy();
  }

  protected get startHidden(): boolean {
    return this.controlPoint.value === null;
  }

  readonly controlPoint!: Bindable<ControlPointGroup | null>;

  #controlPointProperties!: ControlPointProperties;

  @dependencyLoader()
  load() {
    this.width = 350;
    this.autoSizeAxes = Axes.Y;

    const filter = new BackdropBlurFilter({
      strength: 15,
      quality: 3,
      antialias: 'inherit',
      resolution: devicePixelRatio,
    });
    filter.padding = 30;

    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.9,
        cornerRadius: 8,
        // filters: [filter],
      }),
      this.#controlPointProperties = new ControlPointProperties(true),
    );

    this.#controlPointProperties.current = this.controlPoint;

    this.controlPoint.addOnChangeListener((e) => {
      if (e.value)
        this.show();
      else
        this.hide();
    });
  }

  receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    this.controlPoint.value = null;

    // we want the click to pass through the background
    return false;
  }

  popIn() {
    this.fadeInFromZero(200, EasingFunction.OutQuad);
  }

  popOut() {
    this.fadeOut(200, EasingFunction.OutQuad);
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Escape) {
      this.controlPoint.value = null;
      return true;
    }

    return false;
  }
}
