import type { EditorCommand } from '@osucad/common';
import type { BindableNumber, Drawable } from 'osucad-framework';
import { Anchor, Axes, Container } from 'osucad-framework';
import { LabelledDrawable } from './LabelledDrawable';
import { SliderControl } from './SliderControl';
import { TextBox } from './TextBox';

export class LabelledSliderControl extends LabelledDrawable {
  constructor(label: string, private readonly withTextBox: boolean = true) {
    super();
    this.labelText = label;
  }

  control!: SliderControl;

  textBox: TextBox | null = null;

  protected createDrawable(): Drawable {
    if (this.withTextBox) {
      return new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        children: [
          new Container({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            padding: { right: 120 },
            child: this.control = new SliderControl(),
          }),
          this.textBox = new TextBox().with({
            relativeSizeAxes: Axes.None,
            width: 110,
            anchor: Anchor.TopRight,
            origin: Anchor.TopRight,
          }).bindToNumber(this.current),
        ],
      });
    }

    return this.control = new SliderControl();
  }

  protected loadComplete() {
    super.loadComplete();

    if (this.textBox) {
      this.control.value.addOnChangeListener((e) => {
        const value = e.value;
        this.textBox!.text = (Math.round(value * 10000) / 10000).toString();
      });
    }
  }

  get current() {
    return this.control.current;
  }

  set current(value) {
    this.control.current = value;
  }

  withCurrent(current: BindableNumber) {
    this.doWhenLoaded(() => this.current = current);
    return this;
  }

  get commitImmediately(): boolean {
    return this.control.commitImmediately;
  }

  set commitImmediately(value: boolean) {
    this.control.commitImmediately = value;
  }

  bindWithCommandManager(
    bindable: BindableNumber,
    onUpdate: (value: number) => EditorCommand | null,
  ) {
    this.doWhenLoaded(() => this.control.bindWithCommandManager(bindable, onUpdate));
    return this;
  }
}
