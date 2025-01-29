import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { Anchor, Axes, BindableNumber, Dimension, GridContainer, GridSizeMode } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { LabelledSlider } from './LabelledSlider';
import { PreferencesSection } from './PreferencesSection';

export class AudioSection extends PreferencesSection {
  constructor() {
    super('Audio', getIcon('volume-2'));
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(OsucadConfigManager);

    config.bindWith(OsucadSettings.MasterVolume, this.masterVolume);
    config.bindWith(OsucadSettings.MusicVolume, this.musicVolume);
    config.bindWith(OsucadSettings.HitsoundVolume, this.hitsoundVolume);
    config.bindWith(OsucadSettings.UIVolume, this.uiVolume);

    this.addRange([
      new OsucadSpriteText({
        text: 'Volume',
        fontSize: 16,
        alpha: 0.5,
      }),
      new VolumeSlider(this.masterVolume, 'Master'),
      new VolumeSlider(this.musicVolume, 'Music'),
      new VolumeSlider(this.hitsoundVolume, 'Hitsounds'),
      new VolumeSlider(this.uiVolume, 'User Interface'),
    ]);
  }

  readonly masterVolume = new BindableNumber(100)
    .withMinValue(0)
    .withMaxValue(100)
    .withPrecision(1);

  readonly musicVolume = new BindableNumber(100)
    .withMinValue(0)
    .withMaxValue(100)
    .withPrecision(1);

  readonly hitsoundVolume = new BindableNumber(100)
    .withMinValue(0)
    .withMaxValue(100)
    .withPrecision(1);

  readonly uiVolume = new BindableNumber(100)
    .withMinValue(0)
    .withMaxValue(100)
    .withPrecision(1);
}

class VolumeSlider extends GridContainer {
  constructor(value: BindableNumber, label: string) {
    let labelSpriteText: OsucadSpriteText;

    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      rowDimensions: [
        new Dimension(GridSizeMode.AutoSize),
      ],
      columnDimensions: [
        new Dimension(),
        new Dimension(GridSizeMode.Absolute, 30),
      ],
      content: [[
        new LabelledSlider(value, label)
          .withStepSize(10),
        labelSpriteText = new OsucadSpriteText({
          text: '%',
          fontSize: 14,
          anchor: Anchor.CenterRight,
          origin: Anchor.CenterRight,
          alpha: 0.5,
        }),
      ]],
    });

    this.#label = labelSpriteText;

    this.value = value.getBoundCopy();
  }

  #label!: OsucadSpriteText;

  value: BindableNumber;

  protected override loadComplete() {
    super.loadComplete();

    this.value.bindValueChanged((e) => {
      this.#label.text = `${e.value.toFixed(0)} %`;
    }, true);
  }
}
