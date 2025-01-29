import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { Anchor, Axes, BindableNumber, Dimension, GridContainer, GridSizeMode } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { LabelledSlider } from './LabelledSlider';
import { PreferencesSection } from './PreferencesSection';
import { SettingsSlider } from './SettingsSlider';

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
    config.bindWith(OsucadSettings.AudioOffset, this.audioOffset);
    config.bindWith(OsucadSettings.HitSoundOffset, this.hitsoundOffset);

    this.addRange([
      new OsucadSpriteText({
        text: 'Volume',
        fontSize: 16,
        alpha: 0.75,
      }),
      new SettingsSlider('Master', this.masterVolume, e => `${e.toFixed(0)}%`),
      new SettingsSlider('Music', this.musicVolume, e => `${e.toFixed(0)}%`),
      new SettingsSlider('Hitsounds', this.hitsoundVolume, e => `${e.toFixed(0)}%`),
      new SettingsSlider('User Interface', this.uiVolume, e => `${e.toFixed(0)}%`),
      new OsucadSpriteText({
        text: 'Offset',
        fontSize: 16,
        alpha: 0.75,
        margin: { top: 10 },
      }),
      new SettingsSlider('Audio Offset', this.audioOffset, e => `${e.toFixed(0)}ms`),
      new SettingsSlider('Hitsound Offset', this.hitsoundOffset, e => `${e.toFixed(0)}ms`),
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

  readonly audioOffset = new BindableNumber(0)
    .withMinValue(-250)
    .withMaxValue(250)
    .withPrecision(1);

  readonly hitsoundOffset = new BindableNumber(0)
    .withMinValue(-250)
    .withMaxValue(250)
    .withPrecision(1);
}

class SettingsSliderWithSuffix extends GridContainer {
  constructor(value: BindableNumber, label: string, readonly format: (value: number) => string) {
    let labelSpriteText: OsucadSpriteText;

    super({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      rowDimensions: [
        new Dimension(GridSizeMode.AutoSize),
      ],
      columnDimensions: [
        new Dimension(),
        new Dimension(GridSizeMode.Absolute, 55),
      ],
      content: [[
        new LabelledSlider(value, label),
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
      this.#label.text = this.format(e.value);
    }, true);
  }
}
