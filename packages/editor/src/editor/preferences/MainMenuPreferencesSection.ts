import type { Drawable } from 'osucad-framework';
import { resolved } from 'osucad-framework';
import { OsucadConfigManager } from '../../config/OsucadConfigManager.ts';
import { OsucadSettings } from '../../config/OsucadSettings.ts';
import { PreferencesPanel } from './PreferencesPanel.ts';
import { PreferencesToggle } from './PreferencesToggle.ts';

export class MainMenuPreferencesSection extends PreferencesPanel {
  getTitle(): string {
    return 'Main Menu';
  }

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  createContent(): Drawable[] {
    return [
      new PreferencesToggle(
        'Optimized scrolling',
        this.config.getBindable(OsucadSettings.SongSelectPreventLoadOnScroll)!,
      ),
      new PreferencesToggle(
        'Parallax',
        this.config.getBindable(OsucadSettings.SongSelectParallax)!,
      ),
      new PreferencesToggle(
        'Blur Backgrounds',
        this.config.getBindable(OsucadSettings.SongSelectBackgroundBlur)!,
      ),
    ];
  }
}
