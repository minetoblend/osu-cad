import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { BindableBoolean, BindableNumber } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { PreferencesSection } from './PreferencesSection';
import { SettingsCheckbox } from './SettingsCheckbox';
import { SettingsSlider } from './SettingsSlider';

export class ViewportSection extends PreferencesSection {
  constructor() {
    super('Viewport', getIcon('display'));
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(OsucadConfigManager);

    config.bindWith(OsucadSettings.HitAnimations, this.hitAnimations);
    config.bindWith(OsucadSettings.FollowPoints, this.followPoints);
    config.bindWith(OsucadSettings.SnakingInSliders, this.snakingInSliders);
    config.bindWith(OsucadSettings.SnakingOutSliders, this.snakingOutSliders);
    config.bindWith(OsucadSettings.AnimatedSeek, this.animatedSeek);
    config.bindWith(OsucadSettings.NativeCursor, this.nativeCursor);
    config.bindWith(OsucadSettings.BackgroundDim, this.backgroundDim);

    this.addRange([
      new SettingsSlider('Background dim', this.backgroundDim, format => `${Math.round(format * 100)}%`).with({
        margin: { bottom: 10 },
      }),
      new SettingsCheckbox('Hit animations', this.hitAnimations),
      new SettingsCheckbox('Follow points', this.followPoints),
      new SettingsCheckbox('Snaking in sliders', this.snakingInSliders),
      new SettingsCheckbox('Snaking out sliders', this.snakingOutSliders),
      new SettingsCheckbox('Animated seek', this.animatedSeek),
      new SettingsCheckbox('Native cursor', this.nativeCursor),
    ]);
  }

  readonly hitAnimations = new BindableBoolean();
  readonly followPoints = new BindableBoolean();
  readonly snakingInSliders = new BindableBoolean();
  readonly snakingOutSliders = new BindableBoolean();
  readonly animatedSeek = new BindableBoolean();
  readonly nativeCursor = new BindableBoolean();
  readonly backgroundDim = new BindableNumber()
    .withMinValue(0)
    .withMaxValue(1)
    .withPrecision(0.1);
}
