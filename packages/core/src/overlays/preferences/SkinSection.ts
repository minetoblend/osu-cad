import type { Drawable } from '@osucad/framework';
import { resolved } from '@osucad/framework';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { PreferencesPanel } from './PreferencesPanel';
import { PreferencesToggle } from './PreferencesToggle';

export class SkinSection extends PreferencesPanel {
  getTitle(): string {
    return 'Skin';
  }

  @resolved(OsucadConfigManager)
  protected config!: OsucadConfigManager;

  createContent(): Drawable[] {
    return [
      // new SkinSelect(),
      new PreferencesToggle('Use Skin Hitsounds', this.config.getBindable(OsucadSettings.UseSkinHitSounds)!),
      new PreferencesToggle('Use Beatmap Skins', this.config.getBindable(OsucadSettings.UseBeatmapSkins)!),
      new PreferencesToggle('Use Beatmap Hitsounds', this.config.getBindable(OsucadSettings.BeatmapHitSounds)!),
      new PreferencesToggle('Use Beatmap Combo Colors', this.config.getBindable(OsucadSettings.BeatmapComboColors)!),
    ];
  }
}
