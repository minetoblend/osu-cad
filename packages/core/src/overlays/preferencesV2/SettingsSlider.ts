import type { BindableNumber } from '@osucad/framework';
import { Anchor, Axes, Dimension, GridContainer, GridSizeMode } from '@osucad/framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { SettingsItem } from './SettingsItem';
import { SliderBar } from './SliderBar';

export class SettingsSlider extends SettingsItem {
  constructor(label: string, value: BindableNumber, public format?: (value: number) => string) {
    super(label);

    this.add(
      new GridContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        margin: { top: -4 },
        rowDimensions: [
          new Dimension(GridSizeMode.AutoSize),
        ],
        columnDimensions: [
          new Dimension(),
          new Dimension(GridSizeMode.Absolute, 50),
        ],
        content: [[
          this.#slider = new SliderBar(value),
          this.#spriteText = new OsucadSpriteText({
            text: '',
            fontSize: 12,
            anchor: Anchor.CenterRight,
            origin: Anchor.CenterRight,
          }),
        ]],
      }),
    );

    this.value = value.getBoundCopy();
  }

  readonly value: BindableNumber;

  #slider!: SliderBar;
  #spriteText!: OsucadSpriteText;

  protected override loadComplete() {
    super.loadComplete();

    this.value.bindValueChanged((e) => {
      this.#spriteText.text = this.format?.(e.value) ?? e.value.toFixed(0);
    }, true);
  }
}
