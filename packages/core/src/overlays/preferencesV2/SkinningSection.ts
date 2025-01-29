import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { BindableBoolean } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { PreferencesSection } from './PreferencesSection';
import { SettingsCheckbox } from './SettingsCheckbox';

export class SkinningSection extends PreferencesSection {
  constructor() {
    super('Skinning', getIcon('circle'));
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(OsucadConfigManager);

    config.bindWith(OsucadSettings.UseSkinHitSounds, this.useSkinHitsounds);
    config.bindWith(OsucadSettings.UseBeatmapSkins, this.useBeatmapSkins);
    config.bindWith(OsucadSettings.BeatmapHitSounds, this.beatmapHitsounds);
    config.bindWith(OsucadSettings.BeatmapComboColors, this.beatmapComboColors);

    this.addRange([
      new SettingsCheckbox('Use skin hitsounds', this.useSkinHitsounds),
      new SettingsCheckbox('Use beatmap skins', this.useBeatmapSkins),
      new SettingsCheckbox('Use beatmap hitsounds', this.beatmapHitsounds),
      new SettingsCheckbox('Use beatmap combo colors', this.beatmapComboColors),
    ]);
  }

  readonly useBeatmapSkins = new BindableBoolean();
  readonly useSkinHitsounds = new BindableBoolean();
  readonly beatmapHitsounds = new BindableBoolean();
  readonly beatmapComboColors = new BindableBoolean();
}
