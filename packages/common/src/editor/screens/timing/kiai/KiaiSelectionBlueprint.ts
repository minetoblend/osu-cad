import type { ColorSource } from 'pixi.js';
import type { EffectPoint } from '../../../../controlPoints/EffectPoint';
import { Anchor, Axes, Bindable, BindableBoolean, Container, dependencyLoader } from 'osucad-framework';
import { Toggle } from '../../../../../../editor/src/userInterface/Toggle';
import { KeyframeSelectionBlueprint } from '../KeyframeSelectionBlueprint';
import { KiaiSelectionBody } from './KiaiSelectionBody';

export class KiaiSelectionBlueprint extends KeyframeSelectionBlueprint<EffectPoint> {
  constructor() {
    super();
  }

  override readonly keyframeColor = new Bindable<ColorSource>(0x40F589);

  readonly kiaiActive = new BindableBoolean();

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.X,
        height: 15,
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        child: this.#body = new KiaiSelectionBody(this),
        depth: 1,
      }),
      this.#toggle = new KiaiToggle({
        bindable: this.kiaiActive,
      }).with({
        y: 12,
        scale: 0.7,
        anchor: Anchor.CenterLeft,
        origin: Anchor.TopCenter,
        alpha: 0,
      }),
    );

    this.kiaiActive.addOnChangeListener((evt) => {
      if (this.controlPoint)
        this.controlPoint.kiaiMode = evt.value;
    });

    this.selected.addOnChangeListener((evt) => {
      if (evt.value)
        this.#toggle.show();
      else
        this.#toggle.hide();
    });
  }

  #toggle!: KiaiToggle;

  #body!: KiaiSelectionBody;

  protected override controlPointChanged(controlPoint: EffectPoint) {
    super.controlPointChanged(controlPoint);

    this.kiaiActive.value = controlPoint.kiaiMode;

    if (controlPoint.kiaiMode) {
      this.#body.alpha = 0.5;
      this.keyframeColor.value = 0x40F589;
    }
    else {
      this.#body.alpha = 0;
      this.keyframeColor.value = 0x17734B;
    }
  }
}

class KiaiToggle extends Toggle {
  protected override get activeColor(): number {
    return 0x40F589;
  }
}
