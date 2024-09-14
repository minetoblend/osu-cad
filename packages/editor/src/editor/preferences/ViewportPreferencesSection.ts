import { type Drawable, resolved } from 'osucad-framework';
import { PreferencesStore } from '../../preferences/PreferencesStore';
import { PreferencesPanel } from './PreferencesPanel';
import { PreferencesToggle } from './PreferencesToggle';
import { OsucadConfigManager } from '../../config/OsucadConfigManager.ts';
import { OsucadSettings } from '../../config/OsucadSettings.ts';

export class ViewportPreferencesSection extends PreferencesPanel {
  getTitle(): string {
    return 'Viewport';
  }

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  createContent(): Drawable[] {
    return [
      new PreferencesToggle(
        'Hit animations',
        this.config.getBindable(OsucadSettings.HitAnimations)!,
      ),
      new PreferencesToggle(
        'Follow points',
        this.config.getBindable(OsucadSettings.FollowPoints)!,
      ),
      new PreferencesToggle(
        'Animated seek',
        this.config.getBindable(OsucadSettings.AnimatedSeek)!,
      ),

    ];
  }
}
