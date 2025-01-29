import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { BindableNumber } from '@osucad/framework';
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
      new LabelledSlider(this.masterVolume, 'Master')
        .withStepSize(10),
      new LabelledSlider(this.musicVolume, 'Music')
        .withStepSize(10),
      new LabelledSlider(this.hitsoundVolume, 'Hitsounds')
        .withStepSize(10),
      new LabelledSlider(this.uiVolume, 'User Interface')
        .withStepSize(10),
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
