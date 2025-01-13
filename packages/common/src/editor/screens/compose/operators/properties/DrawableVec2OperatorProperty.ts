import type { Drawable, Vec2 } from 'osucad-framework';
import type { TextBox } from '../../../../../userInterface/TextBox';
import type { Vec2OperatorProperty } from './Vec2OperatorProperty';
import { Axes, Container, FastRoundedBox } from 'osucad-framework';
import { DrawableOperatorProperty } from './DrawableOperatorProperty';
import { OperatorPropertyTextBox } from './OperatorPropertyTextBox';

export class DrawableVec2OperatorProperty extends DrawableOperatorProperty<Vec2> {
  constructor(property: Vec2OperatorProperty) {
    super(property);
  }

  #xTextBox!: TextBox;

  #yTextBox!: TextBox;

  protected override getLabels(): string[] {
    return [
      `${this.property.title} X`,
      'Y',
    ];
  }

  protected override createComponents(): Drawable[] {
    return [
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        children: [
          new FastRoundedBox({
            relativeSizeAxes: Axes.Both,
            height: 2,
            color: 0x000000,
            alpha: 0.4,
            cornerRadius: 4,
          }),
          this.#xTextBox = new OperatorPropertyTextBox().adjust(it => it.noBackground = true),
        ],
      }),
      this.#yTextBox = new OperatorPropertyTextBox().adjust(it => it.noBackground = true),
    ];
  }

  protected override loadComplete() {
    super.loadComplete();

    this.#xTextBox.onCommit.addListener((text) => {
      const value = Number.parseFloat(text);
      if (Number.isFinite(value))
        this.propertyValue.value = this.propertyValue.value.withX(value);
      else
        this.propertyValue.triggerChange();
    });

    this.#yTextBox.onCommit.addListener((text) => {
      const value = Number.parseFloat(text);
      if (Number.isFinite(value))
        this.propertyValue.value = this.propertyValue.value.withY(value);
      else
        this.propertyValue.triggerChange();
    });

    this.propertyValue.bindValueChanged(({ value }) => {
      this.#xTextBox.current.value = value.x.toFixed(3);
      this.#yTextBox.current.value = value.y.toFixed(3);
    }, true);
  }
}
