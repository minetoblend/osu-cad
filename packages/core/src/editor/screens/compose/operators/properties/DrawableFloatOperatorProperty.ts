import type { Drawable } from '@osucad/framework';
import type { TextBox } from '../../../../../userInterface/TextBox';
import type { FloatOperatorProperty } from './FloatOperatorProperty';
import type { OperatorProperty } from './OperatorProperty';
import { DrawableOperatorProperty } from './DrawableOperatorProperty';
import { OperatorPropertyTextBox } from './OperatorPropertyTextBox';

export class DrawableFloatOperatorProperty extends DrawableOperatorProperty<number> {
  constructor(property: OperatorProperty<number>) {
    super(property);
  }

  #textBox!: TextBox;

  protected override createComponents(): Drawable[] {
    return [
      this.#textBox = new OperatorPropertyTextBox(),
    ];
  }

  protected override loadComplete() {
    super.loadComplete();

    const precision = (this.property as FloatOperatorProperty).precision ?? 3;

    this.#textBox.onCommit.addListener((text) => {
      const value = Number.parseFloat(text);
      if (Number.isFinite(value))
        this.propertyValue.value = value;
      else
        this.propertyValue.triggerChange();
    });

    this.propertyValue.bindValueChanged(({ value }) => {
      this.#textBox.current.value = value.toFixed(precision);
    }, true);
  }
}
