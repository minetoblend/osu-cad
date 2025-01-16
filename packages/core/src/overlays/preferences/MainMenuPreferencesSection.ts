import type { Drawable } from '@osucad/framework';
import { resolved } from '@osucad/framework';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { PreferencesPanel } from './PreferencesPanel';
import { PreferencesToggle } from './PreferencesToggle';

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
      new PreferencesToggle(
        'Play Intro Sequence',
        this.config.getBindable(OsucadSettings.PlayIntroSequence)!,

      ),
    ];
  }
}
