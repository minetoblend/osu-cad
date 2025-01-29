import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { BindableBoolean } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { PreferencesSection } from './PreferencesSection';
import { SettingsCheckbox } from './SettingsCheckbox';

export class ViewportSection extends PreferencesSection {
  constructor() {
    super('Graphics', getIcon('display'));
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(OsucadConfigManager);

    config.bindWith(OsucadSettings.HitAnimations, this.hitAnimations);
    config.bindWith(OsucadSettings.FollowPoints, this.followPoints);
    config.bindWith(OsucadSettings.AnimatedSeek, this.animatedSeek);
    config.bindWith(OsucadSettings.NativeCursor, this.nativeCursor);

    this.addRange([
      new SettingsCheckbox('Hit animations', this.hitAnimations),
      new SettingsCheckbox('Follow points', this.followPoints),
      new SettingsCheckbox('Animated seek', this.animatedSeek),
      new SettingsCheckbox('Native cursor', this.nativeCursor),
    ]);
  }

  readonly hitAnimations = new BindableBoolean();
  readonly followPoints = new BindableBoolean();
  readonly animatedSeek = new BindableBoolean();
  readonly nativeCursor = new BindableBoolean();
}
