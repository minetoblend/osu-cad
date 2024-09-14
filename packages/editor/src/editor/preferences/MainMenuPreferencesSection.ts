import { Drawable, resolved } from 'osucad-framework';
import { PreferencesPanel } from './PreferencesPanel.ts';
import { OsucadConfigManager } from '../../config/OsucadConfigManager.ts';
import { PreferencesToggle } from './PreferencesToggle.ts';
import { OsucadSettings } from '../../config/OsucadSettings.ts';

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
    ];
  }
}
