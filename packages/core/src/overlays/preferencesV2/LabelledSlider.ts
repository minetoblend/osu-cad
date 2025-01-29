import { BindableNumber } from '@osucad/framework';
import { LabelledDrawable } from './LabelledDrawable';
import { SliderBar } from './SliderBar';

export class LabelledSlider extends LabelledDrawable<SliderBar> {
  constructor(value: BindableNumber, label: string) {
    super({
      label,
    });

    this.value.bindTo(value);

    this.component.currentNumber = value;
  }

  value = new BindableNumber();

  protected override createComponent(): SliderBar {
    return new SliderBar();
  }

  withStepSize(value: number): this {
    this.component.stepSize = value;
    return this;
  }
}
