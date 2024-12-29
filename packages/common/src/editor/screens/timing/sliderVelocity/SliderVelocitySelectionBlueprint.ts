import type { ColorSource } from 'pixi.js';
import type { DifficultyPoint } from '../../../../controlPoints/DifficultyPoint';
import type { ControlPointLifetimeEntry } from '../../../ui/timeline/ControlPointLifetimeEntry';
import { Bindable, BindableNumber, dependencyLoader } from 'osucad-framework';
import { KeyframeSelectionBlueprint } from '../KeyframeSelectionBlueprint';
import { TimingScreenNumberBadge } from '../TimingScreenNumberBadge';

export class SliderVelocitySelectionBlueprint extends KeyframeSelectionBlueprint<DifficultyPoint> {
  constructor() {
    super();
  }

  override readonly keyframeColor = new Bindable<ColorSource>(0xFFBE40);

  readonly velocityBindable = new BindableNumber(1)
    .withMinValue(0.1)
    .withMaxValue(10.0);

  @dependencyLoader()
  [Symbol('load')]() {
    this.badgeContainer.add(
      new TimingScreenNumberBadge({
        bindable: this.velocityBindable,
        color: this.keyframeColor.value,
        format: value => value.toFixed(2),
        suffix: 'x',
      }),
    );
  }

  protected override onApply(entry: ControlPointLifetimeEntry<DifficultyPoint>) {
    super.onApply(entry);

    this.velocityBindable.bindTo(entry.start.sliderVelocityBindable);
  }

  protected override onFree(entry: ControlPointLifetimeEntry<DifficultyPoint>) {
    super.onApply(entry);

    this.velocityBindable.unbindFrom(entry.start.sliderVelocityBindable);
  }
}
