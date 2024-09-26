import type { Bindable } from 'osucad-framework';
import type { ControlPointGroup } from '../../../../beatmap/timing/ControlPointGroup.ts';
import {
  Axes,
  BindableNumber,
  BindableWithCurrent,
  Container,
  dependencyLoader,
  FillDirection,
  FillFlowContainer,
} from 'osucad-framework';
import { DifficultyProperties } from './DifficultyProperties';
import { LabelledTextBox } from './LabelledTextBox';
import { SampleProperties } from './SampleProperties';
import { TABBABLE_CONTAINER } from './TABBABLE_CONTAINER.ts';
import { TimingProperties } from './TimingProperties';

export class ControlPointProperties extends FillFlowContainer {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      direction: FillDirection.Vertical,
    });
  }

  readonly #current = new BindableWithCurrent<ControlPointGroup | null>(null);

  get controlPointBindable(): Bindable<ControlPointGroup | null> {
    return this.#current;
  }

  get current() {
    return this.#current.current;
  }

  set current(value) {
    this.#current.current = value;
  }

  offset = new BindableNumber(0);

  @dependencyLoader()
  load() {
    this.dependencies.provide(TABBABLE_CONTAINER, this);

    this.add(
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: 12,
        child: new LabelledTextBox('Offset')
          .bindToNumber(this.offset)
          .withTabbableContentContainer(this),
      }),
    );

    const timingProperties = new TimingProperties();

    this.add(timingProperties);
    this.add(new SampleProperties());
    this.add(new DifficultyProperties());
    // this.add(new EffectProperties());
  }

  protected loadComplete() {
    super.loadComplete();

    this.#current.valueChanged.addListener((e) => {
      if (e.previousValue)
        this.unbindFromControlPointGroup(e.previousValue!);

      if (e.value)
        this.bindToControlPointGroup(e.value!);
    });

    if (this.controlPointBindable.value)
      this.bindToControlPointGroup(this.controlPointBindable.value);
  }

  protected bindToControlPointGroup(controlPointGroup: ControlPointGroup) {
    this.offset.bindTo(controlPointGroup.timeBindable);
  }

  protected unbindFromControlPointGroup(controlPointGroup: ControlPointGroup) {
    this.offset.unbindFrom(controlPointGroup.timeBindable);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);
  }
}
